@extends('layouts.common')
@section('content')
    <div class="container">
        <h2>{{$admin->name}}</h2>
        <a href="{{$admin->website}}">{{$admin->website}}</a>
        <p>twitter: {{$admin->Twitter}}</p>
        <p>instagram: {{$admin->Instagram}}</p>
        <p>facebook: {{$admin->Facebook}}</p>
        <p>{!! $admin->profile !!}</p>
        <div>
            <p>logo</p>
            <img src="{{asset('storage/img/shares/artist/logo/'.$admin->logo)}}">
        </div>
        <div>
            <p>eyecatch</p>
            <img src="{{asset('storage/img/shares/artist/eyecatch/'.$admin->eyecatch)}}">
        </div>
        <div>
            <p>background</p>
            <img src="{{asset('storage/img/shares/artist/background/'.$admin->background)}}">
        </div>
    </div>
@endsection
