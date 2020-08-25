<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Article_Admin;
use App\Models\Picture;
use App\Models\Tagging;
use App\MyTools\TagUtils;
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
                'eyecatch' => $matches[0],
            ]);
        /**
         * 存在しないタグは格納しないしみない
         */
        $tag_numbers = TagUtils::Tagtrim($request->tags);
        $article_tags = Tagging::where('article_id', $article->id)->orderBy('tag_id', 'desc')->get()->pluck('tag_id')->toArray();
        $create_taggings = array_diff($tag_numbers, $article_tags);//新たに挿入するタグ
        foreach ($create_taggings as $create_tagging) {
            Tagging::updateOrCreate(['article_id' => $article->id, 'tag_id' => $create_tagging]);
        }
        $delete_taggings = array_diff($article_tags, $tag_numbers);//外されたタグ
        foreach ($delete_taggings as $delete_tagging) {
            Tagging::where(['article_id' => $article->id, 'tag_id' => $delete_tagging])->delete();
        }

        $admin_numbers = TagUtils::Tagtrim($request->admins);
        $article_tags_admin = Article_Admin::where('article_id', $article->id)->orderBy('admin_id', 'desc')->get()->pluck('admin_id')->toArray();
        $create_taggings_admin = array_diff($admin_numbers, $article_tags_admin);//新たに挿入するタグ
        foreach ($create_taggings_admin as $create_tagging_admin) {
            Article_Admin::updateOrCreate(['article_id' => $article->id, 'admin_id' => $create_tagging_admin]);
        }
        $delete_taggings_admin = array_diff($article_tags_admin, $admin_numbers);//外されたタグ
        foreach ($delete_taggings_admin as $delete_tagging_admin) {
            Article_Admin::where(['article_id' => $article->id, 'admin_id' => $delete_tagging_admin])->delete();
        }

        return redirect(route('master.article.edit',['id'=>$article->id]))->with('success','記事を保存しました');
    }
}
