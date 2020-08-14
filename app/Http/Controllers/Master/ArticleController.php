<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Picture;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    //

    public function create()
    {
        return view('master.article.create');
    }

    public function index()
    {
        $articles = Article::paginate(100);

        return view('master.article.index')->with('articles', $articles);
    }

    public function edit($id)
    {
        $article = Article::find($id);

        return view('master.article.create')->with('article', $article);
    }

    public function save(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'body' => 'required',
        ]);
        preg_match('/([^\/]+?)?$/',$request->file_path,$matches);
        $article = Article::updateOrCreate(
            ['id'=>$request->id],
            [
                'title' => $request->title,
                'body' => $request->body,
                'type' => $request->type,
                'eyecatch'=>$matches[0],
            ]);
        return redirect(route('master.article.index'));
    }
}
