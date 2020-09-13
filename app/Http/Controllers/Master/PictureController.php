<?php

namespace App\Http\Controllers\Master;

use App\Models\Article;
use App\Models\Picture;
use EdSDK\FlmngrServer\FlmngrServer;
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
        return view('master.picture.input')->with('articles',Article::get(['id','title']));
    }

    public function upload(Request $request)
    {
        if ($request->isMethod('POST')) {
            $request->validate([
                'image_file' => 'required|file|mimes:jpeg,bmp,png,jpg|max:2048',
                'alt' => 'required|max:255',
                'article_id'=>'required|integer'
            ]);

            $file = $request->file('image_file');
            $file_extension = $file->getClientOriginalExtension();
            $filename = sha1(uniqid());

            Image::make($file)->resize(750, null, function ($constraint) {
                $constraint->aspectRatio();
            })->save(public_path() . '/storage/img/article_pictures/' . $filename . '.' . $file_extension);
            Image::make($file)->resize(250, null, function ($constraint) {
                $constraint->aspectRatio();
            })->save(public_path() . '/storage/img/article_pictures/thumb/' . $filename . '.' . $file_extension);

            $picture = Picture::create([
                'filename' => $filename . '.' . $file_extension,
                'alt' => $request->alt,
                'article_id'=>$request->article_id
            ]);
            return redirect(route('master.picture.input'))->with([
                'success' => '画像を保存しました',
                'picture' => $picture
            ]);
        }
        // GET
        return view('master.home');
    }

    public function ajaxupload()
    {
        return response()->json(['location' => 'unchi']);

    }

    public function filemanager()
    {
        FlmngrServer::flmngrRequest(
            array(
                'dirFiles' => 'storage/img',
                'dirTmp' => 'storage/img',
                'dirCache' => 'storage/img'
            )
        );
    }

    public function index()
    {
        $pictures = Picture::whereNull('deleted_at')->paginate(100);
        return view('master.picture.index')->with('pictures', $pictures);
    }

    public function delete(Request $request)
    {
        $picture = Picture::find($request->id);
        if (Storage::disk('local')->exists('public/img/article_pictures_thumb/' . $picture->filename) && Storage::disk('local')->exists('public/img/article_pictures/thumb/' . $picture->filename)) {
            Storage::disk('local')->delete('public/img/article_pictures/thumb/' . $picture->filename);
            Storage::disk('local')->delete('public/img/article_pictures/' . $picture->filename);
            $picture->deleted_at = now();
            $picture->save();
        }

        return redirect(route('master.picture.index'));
    }

    public function editAlt(Request $request)
    {
        $article = Article::find($request->id);
        $article->alt = $request->alt;
        $article->save();

        return redirect(route('master.picture.index'));
    }
}
