@extends('layouts.common')
@include('layouts.header')
@section('content')
    @foreach($articles as $article)
        <h2>{{$article->title}}</h2>
        <p>{{$article->body}}</p>
        <p>{{$article->created_at}}</p>
    @endforeach
@endsection
@include('layouts.footer')
