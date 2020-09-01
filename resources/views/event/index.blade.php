@extends('layouts.common')
@section('content')
    <div class="container">
        <ul>
            @foreach($events as $event)
                <li><a href="{{route('event.detail',['id'=>$event->id])}}">{{$event->title}}</a></li>
            @endforeach
        </ul>
        {{$events->links()}}
    </div>

@endsection
