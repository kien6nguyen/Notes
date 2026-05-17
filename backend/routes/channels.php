<?php

use Illuminate\Support\Facades\Broadcast;

// Presence channel for collaborative note editing
Broadcast::channel('note.{noteId}', function ($user, $noteId) {
    $note = \App\Models\Note::find($noteId);
    if (!$note) return false;

    // Allow owner
    if ($note->user_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    // Allow shared users
    $share = $note->shares()->where('user_id', $user->id)->first();
    if ($share) {
        return ['id' => $user->id, 'name' => $user->name, 'permission' => $share->permission];
    }

    return false;
});
