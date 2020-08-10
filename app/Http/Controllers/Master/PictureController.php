<?php

namespace App\Http\Controllers\Master;

use App\Models\Picture;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

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
                'image_file' => 'required|file|mimes:jpeg,bmp,png,jpg',
                'alt' => 'required|max:255',
            ]);

            $path = $request->file('image_file')->store('public/img/article_pictures');
            $alt = $request->alt;

            $picture = Picture::create([
                'filename' => basename($path),
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

        if(Storage::disk('local')->delete('public/img/article_pictures'.$picture->filename)){
            $picture->deleted_at = now();
            $picture->save();
        }

        return redirect(route('master.picture.index'));
    }
}
