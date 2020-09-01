<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Article_Admin;
use App\Models\Event;
use App\Models\Event_Admin;
use App\Models\House;
use App\MyTools\Picture;
use App\MyTools\TagUtils;
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
    public function index()
    {
        $houses = House::get(['id', 'name']);
        return view('master.event.index')->with('events', Event::paginate(100));
    }

    public function edit($id)
    {
        return view('master.event.edit')->with('event', Event::find($id))->with('admins', Admin::get(['id', 'name']));
    }

    public function flyer(Request $request){
        $request->validate([
            'flyer' => 'required|file|image|max:4096',
        ]);

        $filename = Picture::Resize($request->id,$request->file('flyer'),1000,null,'/storage/img/shares/event/flyer/');

        if(Event::where('id',$request->id)->update(['flyer'=>$filename])){
            return redirect(route('master.event.edit',['id'=>$request->id]))->with('success','フライヤー画像を保存しました');
        }else{
            return redirect(route('master.event.edit',['id'=>$request->id]))->with('error','フライヤー画像を保存できませんでした');
        }
    }

    public function eyecatch(Request $request){
        $request->validate([
            'eyecatch' => 'required|file|image|max:4096',
        ]);

        $filename = Picture::Resize($request->id,$request->file('eyecatch'),1000,null,'/storage/img/shares/event/eyecatch/');

        if(Event::where('id',$request->id)->update(['eyecatch'=>$filename])){
            return redirect(route('master.event.edit',['id'=>$request->id]))->with('success','アイキャッチ画像を保存しました');
        }else{
            return redirect(route('master.event.edit',['id'=>$request->id]))->with('error','アイキャッチ画像を保存できませんでした');
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'when' => 'required|date_format:Y/m/d H:i',
            'where' => 'required|numeric',
            'comment' => 'nullable',
            'open' => 'required|date_format:Y/m/d H:i',
            'start' => 'required|date_format:Y/m/d H:i',
            'door' => 'nullable|numeric',
            'adv' => 'nullable|numeric',
        ]);

        $event = Event::updateOrCreate(
            [
                'id' => $request->id
            ],
            [
                'title' => $request->title,
                'when' => $request->when,
                'where' => $request->where,
                'comment' => $request->comment,
                'open' => $request->open,
                'start' => $request->start,
                'door' => $request->door,
                'adv' => $request->adv,
            ]
        );

        if ($event) {

            $admin_numbers = TagUtils::Tagtrim($request->admins);
            $event_admins = Event_Admin::where('event_id', $event->id)->orderBy('admin_id', 'desc')->get()->pluck('admin_id')->toArray();
            $create_event_admins = array_diff($admin_numbers, $event_admins);//新たに挿入するタグ
            foreach ($create_event_admins as $create_event_admin) {
                Event_Admin::updateOrCreate(['event_id' => $event->id, 'admin_id' => $create_event_admin]);
            }
            $delete_event_admins = array_diff($event_admins, $admin_numbers);//外されたタグ
            foreach ($delete_event_admins as $delete_event_admin) {
                Event_Admin::where(['event_id' => $event->id, 'admin_id' => $delete_event_admin])->delete();
            }

            return redirect(route('master.event.edit', ['id' => $event->id]))->with('success', '保存しました');
        } else {
            return redirect(route('master.event.index'))->with('error', '保存できませんでした');
        }
    }
}
