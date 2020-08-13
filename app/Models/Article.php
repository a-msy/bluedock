<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    //
    protected $fillable = [
        'id', 'title', 'type', 'body', 'created_at', 'updated_at', 'eyecatch'
    ];
}
