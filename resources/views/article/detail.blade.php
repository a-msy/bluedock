@extends('layouts.common')
@section('content')
    <div class="container">
        <h1>{{$article->title}}</h1>
        <div>
            {!! $article->body !!}
        </div>
        <img src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}">
    </div>
@endsection
