<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    //
    protected $fillable = [
        'id', 'title', 'type', 'body', 'created_at', 'updated_at', 'eyecatch'
    ];

    public function tags()
    {
        return $this->belongsToMany('App\Models\Tag','taggings');
    }
    public function admins()
    {
        return $this->belongsToMany('App\Models\Article_Admin','article_admin');
    }
}
