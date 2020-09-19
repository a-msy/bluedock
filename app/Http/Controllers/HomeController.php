<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Article;
use App\Models\Picture;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $interview_articles = Article::where('type',config('const.ArticleTYPE.Code.interview'))->orderBy('created_at','desc')->take(10)->get();;
        $top_articles = Article::orderBy('updated_at','desc')->take(5)->get();
        $news_articles = Article::where('type',config('const.ArticleTYPE.Code.news'))->orderBy('created_at','desc')->take(10)->get();
        $column_articles = Article::where('type',config('const.ArticleTYPE.Code.column'))->orderBy('created_at','desc')->take(10)->get();
        $artists = Admin::inRandomOrder()->take(12)->get();
        return view('home')->with([
            'interview_articles'=>$interview_articles,
            'top_articles'=>$top_articles,
            'news_articles'=>$news_articles,
            'column_articles'=>$column_articles,
            'artists'=>$artists
        ]);
    }

    public function ImageList(){
        $pictures_array = [];
        $pictures = Picture::whereNull('deleted_at')->get();
        foreach ($pictures as $key => $picture){
            array_push($pictures_array,array("title"=>$picture->alt,"value"=>asset('storage/img/article_pictures'."/".$picture->filename)));
        }
        return response()->json($pictures_array);
    }
}
