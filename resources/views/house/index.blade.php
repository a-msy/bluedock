@extends('layouts.common')
@section('content')
    <div class="container">
        <ul>
            @foreach($houses as $house)
                <li><a href="{{route('house.detail',['id'=>$house->id])}}">{{$house->name}}</a></li>
            @endforeach
        </ul>
        {{$houses->links()}}
    </div>
@endsection
