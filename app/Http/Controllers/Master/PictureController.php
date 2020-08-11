<?php

namespace App\Http\Controllers\Master;

use App\Models\Article;
use App\Models\Picture;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class PictureController extends Controller
{
    //
    public function input()
    {
        return view('master.picture.input');
    }

    public function upload(Request $request)
    {
        if ($request->isMethod('POST')) {
            $request->validate([
                'image_file' => 'required|file|mimes:jpeg,bmp,png,jpg|max:2048',
                'alt' => 'required|max:255',
            ]);

            $filename = $request->file('image_file')->store('public/img/article_pictures');

            $image = Image::make($request->file('image_file')->getRealPath());
            $image->resize(null, 300, function ($constraint) {$constraint->aspectRatio();})
                ->save(public_path() . '/storage/img/article_pictures_thumb'.'/' . basename($filename));
            $alt = $request->alt;

            $picture = Picture::create([
                'filename' => basename($filename),
                'alt' => $alt,
            ]);
            return redirect(route('master.picture.input'))->with([
                'success' => '画像を保存しました',
                'picture' => $picture
            ]);
        }
        // GET
        return view('master.home');
    }

    public function index(){
        $pictures = Picture::whereNull('deleted_at')->paginate(100);
        return view('master.picture.index')->with('pictures',$pictures);
    }

    public function delete(Request $request){
        $picture = Picture::find($request->id);
        if(Storage::disk('local')->exists('public/img/article_pictures_thumb/'.$picture->filename) && Storage::disk('local')->exists('public/img/article_pictures/'.$picture->filename)){
            Storage::disk('local')->delete('public/img/article_pictures_thumb/'.$picture->filename);
            Storage::disk('local')->delete('public/img/article_pictures/'.$picture->filename);
            $picture->deleted_at = now();
            $picture->save();
        }

        return redirect(route('master.picture.index'));
    }

    public function editAlt(Request $request){
        $article = Article::find($request->id);
        $article->alt = $request->alt;
        $article->save();

        return redirect(route('master.picture.index'));
    }
}
