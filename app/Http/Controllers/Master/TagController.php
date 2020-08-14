<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    //

    public function index()
    {
        $tags = Tag::paginate(100);

        return view('master.tag.index')->with('tags', $tags);
    }

    public function create(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'max:255',
                'unique:tags,name',
                function ($attribute, $value, $fail) {
                    if(strpos($value,',') !== false){
                        //入力値のなかにカンマが含まれている場合
                        return $fail('カンマは入力しないでください');
                    }
                },
                function ($attribute, $value, $fail) {
                    if(strpos($value,'%') !== false){
                        //入力値のなかにカンマが含まれている場合
                        return $fail('%は入力しないでください');
                    }
                },
            ],
        ]);


        Tag::create([
            'name' => $request->name
        ]);

        return redirect(route('master.tag.index'));
    }

    public function TagList()
    {
        $tags = Tag::all();
        $tags_array = array();
        foreach ($tags as $key=>$tag){
            $tags_array[$key] = $tag->name."%".$tag->id;
        }
        return response()->json($tags_array);
    }
}
