<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    //
    protected $fillable = [
        'title', 'when', 'where', 'comment', 'eyecatch', 'flyer', 'open', 'start', 'door', 'adv'
    ];
}
