@extends('layouts.common')
@section('content')

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css">

<div class="section-header text-center @isset($addcss) {{$addcss}} @endif" style="@isset($addstyle) {{$addstyle}} @endif">
    <h1>アーティスト一覧</h1>
    <div class="line" style="@isset($addstyle2) {{$addstyle2}} @endif"></div>
</div>

    <div class="container">
        <ul style="width: 100%; list-style: none;">
            @foreach($admins as $admin)
                <li style="padding: 0; float: left; width:50%;">
                    <div style="inline-block; text-align: center;">
                        <img src="https://via.placeholder.com/200" class="object-fit pictures"></img>
                        <br>
                        <a href="{{route('admin.detail',['id'=>$admin->id])}}" style="font-size: 2vw; line-height: 150%;">{{$admin->name}}</a>
                    </div>
                    <div class="tag">
                        Tag
                    </div>
                </li>
            @endforeach
        </ul>
        {{$admins->links()}}
    </div>
@endsection
