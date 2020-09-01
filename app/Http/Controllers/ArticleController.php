<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    //
    public function detail($id){
        $article = Article::find($id);
        if($article->type == 0){
            return response('NotFound',404);
        }else{
            return view('article.detail')->with('article',$article);
        }
    }

    public function index(){
        return view('article.index')->with('articles',Article::where('type','<>',0)->paginate(100));
    }
}
