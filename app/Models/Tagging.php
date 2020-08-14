<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tagging extends Model
{
    //
    protected $fillable = [
        'article_id','tag_id'
    ];
}
