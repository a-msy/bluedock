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

Route::get('/', 'HomeController@index')->name('home');

Route::prefix('schedule')->name('schedule.')->group(function () {
    Route::get('index', 'ScheduleController@index')->name('index');
});

Route::prefix('event')->name('event.')->group(function () {
    Route::get('index', 'EventController@index')->name('index');
    Route::get('{id}', 'EventController@detail')->name('detail');
});

Route::prefix('article')->name('article.')->group(function () {
    Route::get('index', 'ArticleController@index')->name('index');
    Route::get('{id}', 'ArticleController@detail')->name('detail');
});

Route::prefix('band')->name('admin.')->group(function () {
   Route::get('index','AdminController@index')->name('index');
   Route::get('{id}','AdminController@detail')->name('detail');
});

Route::prefix('house')->name('house.')->group(function () {
    Route::get('index','HouseController@index')->name('index');
    Route::get('{id}','HouseController@detail')->name('detail');
});
// top page, 画像ランキング, 各種検索

// ユーザー
Route::namespace('User')->prefix('user')->name('user.')->group(function () {

    // ログイン認証関連
    Auth::routes([
        'login' => true,
        'register' => true,
        'reset' => true,
        'verify' => true,
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
        'reset' => true,
        'verify' => true
    ]);

    // ログイン認証後
    Route::middleware('auth:admin')->group(function () {

        // TOPページ
        Route::resource('home', 'HomeController', ['only' => 'index']);

        Route::prefix('profile')->name('profile.')->group(function () {
            Route::prefix('upload')->name('upload.')->group(function () {
                Route::post('eyecatch', 'ProfileController@UploadEyecatch')->name('eyecatch');
                Route::post('background', 'ProfileController@UploadBackground')->name('background');
                Route::post('logo', 'ProfileController@UploadLogo')->name('logo');
            });
            Route::get('edit', 'ProfileController@Edit')->name('edit');
            Route::post('update', 'ProfileController@Update')->name('update');
        });
    });
});

Route::namespace('Master')->prefix('master')->name('master.')->group(function () {

    // ログイン認証関連
    Auth::routes([
        'login' => true,
        'register' => false,
        'reset' => false,
        'verify' => false
    ]);

    // ログイン認証後
    Route::middleware('auth:master')->group(function () {

        // TOPページ
        Route::resource('home', 'HomeController', ['only' => 'index']);

        Route::prefix('picture')->name('picture.')->group(function () {
            Route::get('input', 'PictureController@input')->name('input');
            Route::post('upload', 'PictureController@upload')->name('upload');
            Route::post('delete', 'PictureController@delete')->name('delete');
            Route::get('index', 'PictureController@index')->name('index');
            Route::post('edit/alt', 'PictureController@editAlt')->name('edit.alt');
        });

        Route::prefix('lfm')->name('lfm.')->group(function () {
            \UniSharp\LaravelFilemanager\Lfm::routes();
        });

        Route::resource('admin', 'AdminController')->only([
            'index', 'show', 'edit', 'store'
        ]);

        Route::prefix('admin')->name('admin.')->group(function () {
            Route::post('eyecatch', 'AdminController@UploadEyecatch')->name('eyecatch');
            Route::post('background', 'AdminController@UploadBackground')->name('background');
            Route::post('logo', 'AdminController@UploadLogo')->name('logo');
        });

        Route::prefix('article')->name('article.')->group(function () {
            Route::get('create', 'ArticleController@create')->name('create');
            Route::post('save', 'ArticleController@save')->name('save');
            Route::get('index', 'ArticleController@index')->name('index');
            Route::get('edit/{id}', 'ArticleController@edit')->name('edit');
        });

        Route::prefix('tag')->name('tag.')->group(function () {
            Route::get('index', 'TagController@index')->name('index');
            Route::post('create', 'TagController@create')->name('create');
        });

        Route::prefix('event')->name('event.')->group(function () {
            Route::get('index', 'EventController@index')->name('index');
            Route::get('edit/{id}', 'EventController@edit')->name('edit');
            Route::post('store', 'EventController@store')->name('store');
            Route::post('eyecatch', 'EventController@eyecatch')->name('eyecatch');
            Route::post('flyer', 'EventController@flyer')->name('flyer');
        });

        Route::prefix('house')->name('house.')->group(function () {
            Route::get('index', 'HouseController@index')->name('index');
            Route::post('store', 'HouseController@store')->name('store');
            Route::get('edit/{id}', 'HouseController@edit')->name('edit');
            Route::post('picstore', 'HouseController@picstore')->name('picstore');
        });

    });
});
