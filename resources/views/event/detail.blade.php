@extends('layouts.common')
@section('content')
    <div class="container">
        <h2>{{$event->title}}</h2>
        <p>{!! $event->comment !!}</p>
        <p>{{$event->when}}</p>
        <p>{{$event->house->name}}</p>
        <p>{{$event->open}}</p>
        <p>{{$event->start}}</p>
        <p>{{$event->door}}</p>
        <p>{{$event->adv}}</p>
    </div>
@endsection
