@extends('layouts.common')
@section('content')

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css">

<div class="thumbnail position-relative">
    <img src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}" class="object-fit"/>
    <div class="position-absolute" style="bottom:0px; z-index:99; margin-left: 1%">
        <h1>{{$article->title}}</h1>
    </div>
</div>

<div class="container" style="font-size: 1vw; margin-top: 10px">
    <div style="font-size: 15px">
        <span style="color:#00bfff">NEWS</span><span style="color: #c0c0c0">|2020.09.15</span>
    </div>
    <div style="line-height: 30px; font-size: 1vw;">
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
</div>

<div class="section-header text-center @isset($addcss) {{$addcss}} @endif" style="@isset($addstyle) {{$addstyle}} @endif"></div>
<br/>
<div　class="tag">
    神宿
</div>

<div class="container-fluid">
    <div class="row">
        <div class="titlebar col-8">
            PICTURE
        </div>
    </div>
    <button> More</button>
    <br/>
    <br/>
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