<?php

namespace App\Http\Controllers\Master;

use App\Models\Picture;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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

            $path = $request->file('image_file')->store('public/img');
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
}
