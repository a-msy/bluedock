<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        return view('admin.index')
            ->with('admins', Admin::select([
                'id',
                'name',
                'website',
                'Twitter',
                'Instagram',
                'Facebook',
                'profile',
                'eyecatch',
                'background',
                'logo',
                'katakana'
            ])->paginate(100));
    }

    public function detail($id){
        return view('admin.detail')
            ->with('admin',Admin::where('id',$id)->select([
                'id',
                'name',
                'website',
                'Twitter',
                'Instagram',
                'Facebook',
                'profile',
                'eyecatch',
                'background',
                'logo',
                'katakana'
            ])->first());
    }
}
