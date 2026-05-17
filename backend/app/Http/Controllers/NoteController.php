<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Events\NoteUpdated;
use App\Events\CursorMoved;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        
        $query = $request->user()->notes()->with('labels');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $notes = $query->orderBy('is_pinned', 'desc')
                        ->orderBy('updated_at', 'desc')
                        ->get();

        // For locked notes, hide content in listing
        $notes->transform(function ($note) {
            if ($note->is_locked) {
                $note->content = null;
                $note->attachments = [];
            }
            return $note;
        });

        return response()->json(array_values($notes->toArray()));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string',
            'is_pinned' => 'boolean',
            'labels' => 'array',
            'password' => 'nullable|string',
            'attachments' => 'nullable|array'
        ]);

        $data = [
            'title' => $validated['title'] ?? '',
            'content' => $validated['content'] ?? '',
            'color' => $validated['color'] ?? 'default',
            'is_pinned' => $validated['is_pinned'] ?? false,
            'attachments' => $validated['attachments'] ?? []
        ];

        if (!empty($validated['password'])) {
            $data['password_hash'] = Hash::make($validated['password']);
        }

        $note = $request->user()->notes()->create($data);

        if (isset($validated['labels'])) {
            $note->labels()->sync($validated['labels']);
        }

        return response()->json($note->load('labels'), 201);
    }

    public function show(Request $request, Note $note)
    {
        $userId = $request->user()->id;

        // Check ownership or share access
        if ($note->user_id !== $userId) {
            $share = $note->shares()->where('user_id', $userId)->first();
            if (!$share) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Handle password protected notes
        if ($note->password_hash) {
            $providedPassword = $request->header('X-Note-Password');
            if (!$providedPassword || !Hash::check($providedPassword, $note->password_hash)) {
                return response()->json([
                    'message' => 'Password required',
                    'is_locked' => true,
                    'id' => $note->id,
                    'title' => $note->title,
                ], 423); // 423 Locked
            }
        }

        return response()->json($note->load('labels'));
    }

    public function update(Request $request, Note $note)
    {
        $userId = $request->user()->id;

        // Check ownership or edit permission
        if ($note->user_id !== $userId) {
            $share = $note->shares()->where('user_id', $userId)->where('permission', 'edit')->first();
            if (!$share) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string',
            'is_pinned' => 'boolean',
            'labels' => 'array',
            'password' => 'nullable|string',
            'remove_password' => 'nullable|boolean',
            'attachments' => 'nullable|array'
        ]);

        $data = $request->only(['title', 'content', 'color', 'is_pinned', 'attachments']);
        
        // Set password
        if (!empty($validated['password'])) {
            $data['password_hash'] = Hash::make($validated['password']);
        }
        
        // Remove password
        if ($request->boolean('remove_password')) {
            $data['password_hash'] = null;
        }

        $note->update($data);

        if ($request->has('labels')) {
            $note->labels()->sync($validated['labels']);
        }

        // Broadcast update to collaborators
        broadcast(new NoteUpdated(
            $note->id,
            $note->load('labels')->toArray(),
            $request->user()->id,
            $request->user()->name
        ))->toOthers();

        return response()->json($note->load('labels'));
    }

    public function destroy(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }

    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimes:jpeg,png,jpg,gif,pdf,doc,docx' // 5MB
        ]);

        $path = $request->file('file')->store('attachments', 'public');
        return response()->json(['url' => '/storage/' . $path]);
    }

    // Broadcast cursor position for real-time collaboration
    public function broadcastCursor(Request $request, Note $note)
    {
        $request->validate(['position' => 'required|integer']);

        broadcast(new CursorMoved(
            $note->id,
            $request->user()->id,
            $request->user()->name,
            $request->position
        ))->toOthers();

        return response()->json(['status' => 'ok']);
    }
}
