<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event_Admin extends Model
{
    protected $fillable = [
        'event_id','admin_id'
    ];

    protected $table = "event_admins";
}
