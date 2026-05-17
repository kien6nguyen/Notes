<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'name', 'color'])]
class Label extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notes()
    {
        return $this->belongsToMany(Note::class);
    }
}
