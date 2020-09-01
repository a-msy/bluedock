<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    //
    public function detail($id){
        return view('event.detail')->with('event',Event::find($id));
    }

    public function index(){
        return view('event.index')->with('events',Event::paginate(100));
    }
}
