<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    //
    public function AdminTag()
    {
        $admins = Admin::get(['id','name']);
        $admins_array = array();
        foreach ($admins as $key => $admin) {
            $admins_array[$key] = $admin->name . "%" . $admin->id;
        }
        return response()->json($admins_array);
    }
}
