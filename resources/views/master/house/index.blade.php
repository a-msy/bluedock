@extends('layouts.master_common')
@section('content')
    <div class="container mt-3">
        <h2>ライブハウス一覧</h2>
        <table class="table">
            <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">写真</th>
                <th scope="col">名前</th>
                <th scope="col">連絡先</th>
                <th scope="col">作成日</th>
            </tr>
            </thead>
            <tbody>
            @foreach($houses as $house)
                <tr>
                    <th scope="row">{{$house->id}}</th>
                    <th><img style="width:200px; height: auto;" src="{{asset('storage/img/house/'.$house->picture)}}"></th>
                    <td><a href="{{route('master.house.edit',['id'=>$house->id])}}">{{$house->name}}</a></td>
                    <td>{{$house->contact}}</td>
                    <td>{{$house->created_at}}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
        {{$houses->links()}}
    </div>
@endsection
