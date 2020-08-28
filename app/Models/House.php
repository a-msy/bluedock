<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    //
    protected $fillable = [
        'name', 'addr', 'access', 'contact', 'website', 'capacity', 'parking', 'picture',
    ];
}
