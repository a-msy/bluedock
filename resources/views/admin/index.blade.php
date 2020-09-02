@extends('layouts.common')
@section('content')
    <div class="container">
        <ul>
            @foreach($admins as $admin)
                <li><a href="{{route('admin.detail',['id'=>$admin->id])}}">{{$admin->name}}</a></li>
            @endforeach
        </ul>
        {{$admins->links()}}
    </div>
@endsection
