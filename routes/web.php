<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
| https://qiita.com/namizatop/items/5d56d96d4c255a0e3a87
*/

Route::get('/','HomeController@index')->name('home');


// ユーザー
Route::namespace('User')->prefix('user')->name('user.')->group(function () {

    // ログイン認証関連
    Auth::routes([
        'register' => true,
        'reset'    => false,
        'verify'   => false
    ]);

    // ログイン認証後
    Route::middleware('auth:user')->group(function () {

        // TOPページ
        Route::resource('home', 'HomeController', ['only' => 'index']);

    });
});

// 管理者
Route::namespace('Admin')->prefix('admin')->name('admin.')->group(function () {

    // ログイン認証関連
    Auth::routes([
        'login' => true,
        'register' => true,
        'reset' => false,
        'verify' => true
    ]);

    // ログイン認証後
    Route::middleware('auth:admin')->group(function () {

        // TOPページ
        Route::resource('home', 'HomeController', ['only' => 'index']);

    });
});

Route::namespace('Master')->prefix('master')->name('master.')->group(function () {

    // ログイン認証関連
    Auth::routes([
        'login'=>true,
        'register' => false,
        'reset' => false,
        'verify' => false
    ]);

    // ログイン認証後
    Route::middleware('auth:master')->group(function () {

        // TOPページ
        Route::resource('home', 'HomeController', ['only' => 'index']);
        Route::prefix('picture')->name('picture.')->group(function (){
            Route::get('input','PictureController@input')->name('input');
            Route::post('upload','PictureController@upload')->name('upload');
            Route::post('delete','PictureController@delete')->name('delete');
            Route::get('index','PictureController@index')->name('index');
            Route::post('edit/alt','PictureController@editAlt')->name('edit.alt');
        });

        Route::prefix('article')->name('article.')->group(function (){
            Route::get('create','ArticleController@create')->name('create');
            Route::post('save','ArticleController@save')->name('save');
            Route::get('index','ArticleController@index')->name('index');
            Route::get('edit/{id}','ArticleController@edit')->name('edit');
        });

    });
});
