<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    //
    public function index(){
        return view('schedule.index');
    }

    public function eventList(Request $request){
        $start = $request->start;
        $end = $request->end;
        $events = Event::whereBetween('when', [$start, $end])->get();
        $eventLists = array();
        foreach ($events as $key=>$event){
            $eventLists[$key]['id'] = $event->id;
            $eventLists[$key]['title'] = $event->title;
            $eventLists[$key]['start'] = $event->start;
            $eventLists[$key]['end'] = $event->start;
            $eventLists[$key]['url'] = route('event.detail',['id'=>$event->id]);
//            $eventLists[$key]['description'] = "【OPEN】".$event->open->format('H時i分')."　"."【START】".$event->start->format('H時i分')."　"."【ADV】".$event->adv."円"."　　　"."【DOOR】".$event->door."円";
        }
        return response()->json($eventLists);
    }
}
