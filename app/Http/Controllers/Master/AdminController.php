<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Facades\Image;

class AdminController extends Controller
{
    public function AdminTag()
    {
        $admins = Admin::get(['id','name']);
        $admins_array = array();
        foreach ($admins as $key => $admin) {
            $admins_array[$key] = $admin->name . "%" . $admin->id;
        }
        return response()->json($admins_array);
    }

    public function index()
    {
        $admins = Admin::paginate(100);
        return view('master.admin.index')->with('admins',$admins);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'profile' => 'nullable|max:65535',
            'name'=>'required|max:200',
            'email'=>'required|unique:users|email',
            'website'=>'nullable',
            'twitter'=>'nullable',
            'facebook'=>'nullable',
            'instagram'=>'nullable',
        ]);
        if(Admin::where('id',$request->id)->update([
            'profile'=>$request->profile,
            'name'=>$request->name,
            'email'=>$request->email,
            'website'=>$request->website,
            'Twitter'=>$request->twitter,
            'Instagram'=>$request->instagram,
            'Facebook'=>$request->facebook]
        )){
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('success','プロフィールを保存しました');
        }else{
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('error','プロフィールを保存できませんでした');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        //
    }

    public function edit($id)
    {
        //
        $admin = Admin::find($id);
        return view('master.admin.edit')->with('admin',$admin);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        //
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

        $filename = $this->Resize($request->id,$request->file('logo'),500,null,'/storage/img/artist/logo/');

        if(Admin::where('id',$request->id)->update(['logo'=>$filename])){
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('success','ロゴ画像を保存しました');
        }else{
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('error','ロゴ画像を保存できませんでした');
        }
    }
    public function UploadEyecatch(Request $request){
        $request->validate([
            'eyecatch' => 'required|file|image|max:4096',
        ]);

        $filename = $this->Resize($request->id,$request->file('eyecatch'),1000,null,'/storage/img/artist/eyecatch/');

        if(Admin::where('id',$request->id)->update(['eyecatch'=>$filename])){
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('success','アイキャッチ画像を保存しました');
        }else{
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('error','アイキャッチ画像を保存できませんでした');
        }
    }
    public function UploadBackground(Request $request){
        $request->validate([
            'background' => 'required|file|image|max:4096',
        ]);

        $filename = $this->Resize($request->id,$request->file('background'),1920,null,'/storage/img/artist/background/');

        if(Admin::where('id',$request->id)->update(['background'=>$filename])){
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('success','背景画像を保存しました');
        }else{
            return redirect(route('master.admin.edit',['admin'=>$request->id]))->with('error','背景画像を保存できませんでした');
        }
    }
}
