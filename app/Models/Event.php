<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    //
    protected $fillable = [
        'title', 'when', 'where', 'comment', 'eyecatch', 'flyer', 'open', 'start', 'door', 'adv'
    ];
    protected $dates = ['when','open','start', 'created_at', 'updated_at'];

    public function admins()
    {
        return $this->belongsToMany('App\Models\Admin','event_admins');
    }
    public function house(){
        return $this->belongsTo('App\Models\House','where','id');
    }
}
