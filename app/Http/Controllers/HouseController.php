<?php

namespace App\Http\Controllers;

use App\Models\House;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    public function index(){
        return view('house.index')
            ->with('houses',House::paginate(100));
    }

    public function detail($id){
        return view('house.detail')
            ->with('house',House::find($id));
    }
}
