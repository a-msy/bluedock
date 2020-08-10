<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Picture;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    //

    public function create(){
        $pictures = Picture::whereNull('deleted_at')->get();
        return view('master.article.create')->with('pictures',$pictures);
    }
}
