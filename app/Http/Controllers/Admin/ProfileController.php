<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Facades\Image;

class ProfileController extends Controller
{
    //
    public function Edit(){
        $data = Admin::find(Auth::guard('admin')->id());
        return view('admin.edit')->with([
            'data'=>$data
        ]);
    }

    public function Resize($id,$avatar,$width,$height,$path){
        $filename = $id . '.' . $avatar->getClientOriginalExtension();
        Image::make($avatar)->resize($width, $height, function($constraint){
            $constraint->aspectRatio();
        })->save( public_path($path . $filename ) );
        return $filename;
    }

    public function UploadLogo(Request $request){
        $request->validate([
            'logo' => 'required|file|image|max:4096',
        ]);

        $filename = $this->Resize(Auth::guard('admin')->id(),$request->file('logo'),500,null,'/storage/img/artist/logo/');

        if(Admin::where('id',Auth::guard('admin')->id())->update(['logo'=>$filename])){
            return redirect(route('admin.profile.edit'))->with('success','ロゴ画像を保存しました');
        }else{
            return redirect(route('admin.profile.edit'))->with('error','ロゴ画像を保存できませんでした');
        }
    }
    public function UploadEyecatch(Request $request){
        $request->validate([
            'eyecatch' => 'required|file|image|max:4096',
        ]);

        $filename = $this->Resize(Auth::guard('admin')->id(),$request->file('eyecatch'),1000,null,'/storage/img/artist/eyecatch/');

        if(Admin::where('id',Auth::guard('admin')->id())->update(['eyecatch'=>$filename])){
            return redirect(route('admin.profile.edit'))->with('success','アイキャッチ画像を保存しました');
        }else{
            return redirect(route('admin.profile.edit'))->with('error','アイキャッチ画像を保存できませんでした');
        }
    }
    public function UploadBackground(Request $request){
        $request->validate([
            'background' => 'required|file|image|max:4096',
        ]);

        $filename = $this->Resize(Auth::guard('admin')->id(),$request->file('background'),1920,null,'/storage/img/artist/background/');

        if(Admin::where('id',Auth::guard('admin')->id())->update(['background'=>$filename])){
            return redirect(route('admin.profile.edit'))->with('success','背景画像を保存しました');
        }else{
            return redirect(route('admin.profile.edit'))->with('error','背景画像を保存できませんでした');
        }
    }
}
