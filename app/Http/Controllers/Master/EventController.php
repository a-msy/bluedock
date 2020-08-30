<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Event;
use App\Models\House;
use Illuminate\Http\Request;

/**
 * いつ
 * どこで=>ライブハウスDB
 * だれが
 * 内容
 * タイトル
 * アイキャッチ
 * フライヤー
 */

class EventController extends Controller
{
    //
    public function index(){
        $houses = House::get(['id','name']);
        return view('master.event.index')->with('events',Event::paginate(100));
    }
    public function edit($id){
        return view('master.event.edit')->with('event',Event::find($id))->with('admins',Admin::get(['id','name']));
    }
    public function store(Request $request){
        $request->validate([
            'title' => 'required|max:255',
            'when' => 'required|date_format',
            'where' => 'required|numeric',
            'comment'=>'nullable',
            'open' => 'required|date_format',
            'start' => 'required|date_format',
            'door'=>'nullable|numeric',
            'adv'=>'nullable|numeric',
        ]);
    }
}
