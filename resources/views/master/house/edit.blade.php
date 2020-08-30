@extends('layouts.master_common')
@section('content')
    <section class="container">
        <h2>イメージ画像</h2>
        <form class="mt-3" action="{{route('master.house.picstore')}}" method="POST" enctype="multipart/form-data">
            @csrf
            <input type="hidden" name="id" value="{{$house->id}}">
            <div>
                <input type="file" name="picture" class="form-control" required>
                <p class="small">*jpg,png形式 4096KB以下</p>
                <p class="small">*画像はリサイズされます</p>
            </div>
            <button type="submit" class="btn btn-primary">アップロード</button>
        </form>
    </section>
    <section class="container">
        <form action="{{route('master.house.store')}}" method="POST" class="mt-3">
            @csrf
            <h2>ライブハウス情報</h2>
            <input type="hidden" name="id" value="{{$house->id}}">
            <div class="form-group">
                <label>名前</label>
                <input class="form-control" value="{{$house->name}}" name="name" required>
            </div>
            <div class="form-group">
                <label>連絡先</label>
                <input class="form-control" value="{{$house->contact}}" name="contact" required>
            </div>
            <div class="form-group">
                <label>住所</label>
                <input class="form-control" value="{{$house->addr}}" name="addr">
            </div>
            <div class="form-group">
                <label>アクセス</label>
                <input class="form-control" name="access" value="{{$house->access}}">
            </div>
            <div class="form-group">
                <label>ウェブサイト</label>
                <input class="form-control" name="website" value="{{$house->website}}">
            </div>
            <div class="form-group">
                <label>駐車場</label>
                <select class="form-control" name="parking">
                    @foreach(config('const.Parking') as $key=>$value)
                        <option value="{{$key}}" @if($key==$house->parking) selected @elseif($key==0) selected @endif>{{$value}}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group">
                <label>キャパシティ</label>
                <input class="form-control" name="capacity" value="{{$house->capacity}}">
            </div>
            <button type="submit" class="btn btn-primary">保存</button>
        </form>
    </section>
@endsection
