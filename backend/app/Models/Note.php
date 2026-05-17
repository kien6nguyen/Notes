<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'title', 'content', 'is_pinned', 'color', 'password_hash', 'attachments'])]
class Note extends Model
{
    protected $casts = [
        'is_pinned' => 'boolean',
        'attachments' => 'array',
    ];

    // Hide password_hash from JSON but keep is_locked accessor
    protected $hidden = ['password_hash'];
    protected $appends = ['is_locked', 'is_shared'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function labels()
    {
        return $this->belongsToMany(Label::class);
    }

    public function shares()
    {
        return $this->hasMany(NoteShare::class);
    }

    public function sharedWith()
    {
        return $this->belongsToMany(User::class, 'note_shares')->withPivot('permission')->withTimestamps();
    }

    // Accessors
    public function getIsLockedAttribute()
    {
        return !empty($this->password_hash);
    }

    public function getIsSharedAttribute()
    {
        return $this->shares()->exists();
    }
}
