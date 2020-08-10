<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Picture;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    //

    public function create(){
        return view('master.article.create');
    }

    public function save(Request $request){
        $article = Article::create([
           'title'=>$request->title,
           'body'=>$request->body,
           'type'=>$request->type
        ]);
        return redirect(route('master.article.create'));
    }
}
