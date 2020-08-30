@extends('layouts.master_common')
@section('content')
    <div class="container">
        <h2>新規登録</h2>
        <form action="{{route('master.house.store')}}" method="POST" class="mt-3">
            @csrf
            <div class="form-group">
                <label>名前</label>
                <input class="form-control" name="name" required>
            </div>
            <div class="form-group">
                <label>連絡先</label>
                <input class="form-control"  name="contact" required>
            </div>
            <div class="form-group">
                <label>住所</label>
                <input class="form-control"  name="addr">
            </div>
            <div class="form-group">
                <label>アクセス</label>
                <input class="form-control" name="access" >
            </div>
            <div class="form-group">
                <label>ウェブサイト</label>
                <input class="form-control" name="website" >
            </div>
            <div class="form-group">
                <label>駐車場</label>
                <select class="form-control" name="parking">
                    @foreach(config('const.Parking') as $key=>$value)
                        <option value="{{$key}}" @if($key==0) selected @endif>{{$value}}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group">
                <label>キャパシティ</label>
                <input class="form-control" name="capacity" type="number">
            </div>
            <button type="submit" class="btn btn-primary">保存</button>
        </form>
    </div>
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
