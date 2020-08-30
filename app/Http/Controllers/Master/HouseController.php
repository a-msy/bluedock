<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\House;
use App\MyTools\Picture;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    //
    public function index(){
        return view('master.house.index')->with('houses',House::paginate(100));
    }

    public function edit($id){
        return view('master.house.edit')->with('house',House::find($id));
    }

    public function picstore(Request $request){
        $request->validate([
            'picture' => 'required|file|image|max:4096',
        ]);

        $filename = Picture::Resize($request->id,$request->file('picture'),1000,null,'/storage/img/shares/house/');

        if(House::where('id',$request->id)->update(['picture'=>$filename])){
            return redirect(route('master.house.edit',['id'=>$request->id]))->with('success','画像を保存しました');
        }else{
            return redirect(route('master.house.edit',['id'=>$request->id]))->with('error','画像を保存できませんでした');
        }
    }

    public function store(Request $request){
        $request->validate([
            'name' => 'required|max:255',
            'contact' => 'required|max:255',
            'addr' => 'required|max:255',
            'access'=>'nullable|max:255',
            'website'=>'nullable|max:255',
            'parking'=>'nullable|digits_between:0,1',
            'capacity'=>'nullable|'
        ]);

        $house = House::updateOrCreate(
            [
                'id'=>$request->id
            ],
            [
                'name'      =>$request->name,
                'contact'   =>$request->contact,
                'addr'      =>$request->addr,
                'access'    =>$request->access,
                'website'   =>$request->website,
                'parking'   =>$request->parking,
                'capacity'  =>$request->capacity,
            ]
        );
        if($house){
            return redirect(route('master.house.edit',['id'=>$house->id]))->with('success','保存しました');
        }
        else{
            return redirect(route('master.house.index'))->with('error','保存できませんでした');
        }

    }
}
