<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('image_list','HomeController@ImageList')->name('image_list');
Route::post('ajaxupload','Master\PictureController@ajaxupload')->name('api.ajaxupload');
Route::any('filemanager','Master\PictureController@filemanager')->name('api.filemanager');
Route::any('tag_list','Master\TagController@TagList')->name('api.tag_list');
Route::get('admin_tag','Master\AdminController@AdminTag')->name('api.admin_tag');
Route::get('event_list','ScheduleController@eventList')->name('api.event_list');
