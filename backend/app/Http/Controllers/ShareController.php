<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\User;
use App\Models\NoteShare;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    // Share a note with a user
    public function share(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can share this note'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'permission' => 'required|in:read,edit',
        ]);

        $targetUser = User::where('email', $validated['email'])->first();

        if ($targetUser->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot share with yourself'], 400);
        }

        $share = NoteShare::updateOrCreate(
            ['note_id' => $note->id, 'user_id' => $targetUser->id],
            ['permission' => $validated['permission']]
        );

        return response()->json([
            'message' => 'Note shared successfully',
            'share' => [
                'id' => $share->id,
                'user' => ['id' => $targetUser->id, 'name' => $targetUser->name, 'email' => $targetUser->email],
                'permission' => $share->permission,
            ]
        ]);
    }

    // Remove share
    public function unshare(Request $request, Note $note, $userId)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can manage sharing'], 403);
        }

        NoteShare::where('note_id', $note->id)->where('user_id', $userId)->delete();

        return response()->json(['message' => 'Share removed']);
    }

    // Get shares for a note
    public function getShares(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shares = $note->shares()->with('user:id,name,email')->get()->map(function ($share) {
            return [
                'id' => $share->id,
                'user' => $share->user,
                'permission' => $share->permission,
            ];
        });

        return response()->json($shares);
    }

    // Get notes shared with me
    public function sharedWithMe(Request $request)
    {
        $notes = $request->user()->sharedNotes()
            ->with(['labels', 'user:id,name,email'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($note) {
                $note->share_permission = $note->pivot->permission;
                $note->owner = $note->user;
                return $note;
            });

        return response()->json($notes);
    }

    // Unlock a password-protected note
    public function unlock(Request $request, Note $note)
    {
        $userId = $request->user()->id;

        if ($note->user_id !== $userId && !$note->shares()->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$note->password_hash) {
            return response()->json(['message' => 'Note is not locked'], 400);
        }

        $request->validate(['password' => 'required|string']);

        if (!\Illuminate\Support\Facades\Hash::check($request->password, $note->password_hash)) {
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        return response()->json($note->load('labels'));
    }

    // Change password on a locked note
    public function changePassword(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can change the password'], 403);
        }

        if (!$note->password_hash) {
            return response()->json(['message' => 'Note is not locked'], 400);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:4',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $note->password_hash)) {
            return response()->json(['message' => 'Current password is incorrect'], 401);
        }

        $note->update(['password_hash' => \Illuminate\Support\Facades\Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
