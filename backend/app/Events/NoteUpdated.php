<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $noteId;
    public $noteData;
    public $userId;
    public $userName;

    public function __construct($noteId, $noteData, $userId, $userName)
    {
        $this->noteId = $noteId;
        $this->noteData = $noteData;
        $this->userId = $userId;
        $this->userName = $userName;
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel('note.' . $this->noteId)];
    }

    public function broadcastAs(): string
    {
        return 'note.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'note_id' => $this->noteId,
            'data' => $this->noteData,
            'user_id' => $this->userId,
            'user_name' => $this->userName,
        ];
    }
}
