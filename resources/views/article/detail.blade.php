@extends('layouts.common')
@section('content')

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css">

<section class="thumbnail position-relative">
    <h1 class="position-absolute text-white mx-1" style="z-index: 99; bottom: 0;left: 0;right: 0;margin: auto;">
        <span class="background-theme p-1">{{$article->title}}</span>
    </h1>
    <img src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}" class="object-fit" style="z-index: -1;"/>
</section>

<section class="container">
    <div style="font-size: 15px"><span>NEWS</span><span style="color: #c0c0c0">｜2020.09.15</span></div>
    <div style="line-height: 30px;">
        <figure class="float-right">
            <img src="http://via.placeholder.com/150x100">
            <figcaption style="color: grey;">
                TEST
            </figcaption>
            <figcaption class="zoom float-right">
                拡大
            </figcaption>
        </figure>
        {!! $article->body !!}
    </div>
</section>

<div class="section-header text-center @isset($addcss) {{$addcss}} @endif" style="@isset($addstyle) {{$addstyle}} @endif"></div>
<div class="tag">
    神宿
</div>
<div class="container-fluid">
    <div class="row">
        <div class="titlebar col-8">
            PICTURE
        </div>
    </div>
    <button class="">More</button>
    <div class="row">
        <div class="titlebar col-8">
            神宿
        </diV>
    </div>
</div>
@include('layouts.section-header',['title'=>'INTERVIEW',])
<section class="background-black overflow-hidden popular">
    {{--        TODO::人気順記事を取得するロジックを組む--}}
    @include('layouts.section-header',['title'=>'POPULAR','addcss'=>"text-white",'addstyle'=>"",'addstyle2'=>"border-color:white !important;"])
</section>
@include('layouts.section-header',['title'=>'Pics Ranking',])
@endsection
