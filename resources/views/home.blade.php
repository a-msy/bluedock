@extends('layouts.common')
@section('content')
    @foreach($articles as $article)
        <h2>{{$article->title}}</h2>
        <p>{!! $article->body !!}</p>
        <p>{{$article->created_at}}</p>
    @endforeach
@endsection
