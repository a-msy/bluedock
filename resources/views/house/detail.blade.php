@extends('layouts.common')
@section('content')
    <div class="container">
        <h2>{{$house->name}}</h2>
        <a href="{{$house->website}}">{{$house->website}}</a>
        <p>{{$house->addr}}</p>
        <p>{{$house->contact}}</p>
        <p>{{$house->access}}</p>
        <p>{{$house->capacity}}人</p>
        <p>駐車場：{{config('const.Parking.'.$house->parking)}}</p>
        <div>
            <p>picture</p>
            <img src="{{asset('storage/img/shares/house/'.$house->picture)}}">
        </div>
    </div>
@endsection
