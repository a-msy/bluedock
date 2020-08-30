@extends('layouts.master_common')
@section('content')
<div class="container mt-3">
    <h2>イベント一覧</h2>
    <table class="table">
        <thead>
        <tr>
            <th scope="col">ID</th>
            <th scope="col">タイトル</th>
            <th scope="col">開催日</th>
            <th scope="col">作成日</th>
        </tr>
        </thead>
        <tbody>
        @foreach($events as $event)
            <tr>
                <th scope="row">{{$event->id}}</th>
                <td><a href="{{route('master.event.edit',['id'=>$event->id])}}">{{$event->title}}</a></td>
                <td>{{$event->when->format('Y/m/d')}}</td>
                <td>{{$event->created_at}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
    {{$events->links()}}
</div>
@endsection
