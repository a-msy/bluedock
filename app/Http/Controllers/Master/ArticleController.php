<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Picture;
use App\Models\Tagging;
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

        return view('master.article.create')->with([
            'article'=>$article,
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'body' => 'required',
        ]);

        preg_match('/([^\/]+?)?$/', $request->file_path, $matches);

        $article = Article::updateOrCreate(
            ['id' => $request->id],
            [
                'title' => $request->title,
                'body' => $request->body,
                'type' => $request->type,
                'eyecatch' => $matches[0]
            ]);
        /**
         * 存在しないタグは格納しないしみない
         */
        $tags = explode(",", $request->tags);//idの切り出し
        $tag_numbers = array();
        foreach ($tags as $key => $tag) {
            $num = substr(strstr($tag, '%'), 1);
            if ($num != false) {
                $tag_numbers[$key] = $num;
            }
        }
        $tag_numbers = array_unique($tag_numbers);//重複を消す

        $article_tags = Tagging::where('article_id', $article->id)->orderBy('tag_id', 'desc')->get()->pluck('tag_id')->toArray();
        $create_taggings = array_diff($tag_numbers, $article_tags);//新たに挿入するタグ
        foreach ($create_taggings as $create_tagging) {
            Tagging::updateOrCreate(['article_id' => $article->id, 'tag_id' => $create_tagging]);
        }
        $delete_taggings = array_diff($article_tags, $tag_numbers);//外されたタグ
        foreach ($delete_taggings as $delete_tagging) {
            Tagging::where(['article_id' => $article->id, 'tag_id' => $delete_tagging])->delete();
        }

        return redirect(route('master.article.index'));
    }
}
