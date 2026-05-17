<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CursorMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $noteId;
    public $userId;
    public $userName;
    public $position;

    public function __construct($noteId, $userId, $userName, $position)
    {
        $this->noteId = $noteId;
        $this->userId = $userId;
        $this->userName = $userName;
        $this->position = $position;
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel('note.' . $this->noteId)];
    }

    public function broadcastAs(): string
    {
        return 'cursor.moved';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'position' => $this->position,
        ];
    }
}
