<?php

namespace App\Http\Controllers;

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
        $articles = Article::all();
        return view('home')->with([
            'articles'=>$articles,
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
