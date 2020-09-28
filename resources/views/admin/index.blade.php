@extends('layouts.common')
@section('content')

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css">

<div class="section-header text-center @isset($addcss) {{$addcss}} @endif" style="@isset($addstyle) {{$addstyle}} @endif">
    <h1>アーティスト一覧</h1>
    <div class="line" style="@isset($addstyle2) {{$addstyle2}} @endif"></div>
</div>

    <div class="container">
        <div class="row">
            @foreach($admins as $admin)
                <div class="col-6 text-center">
                    <div class="pictures">
                        <img src="https://via.placeholder.com/200" class="object-fit"></img>
                    </div>
                    <div class="">
                        <a href="{{route('admin.detail',['id'=>$admin->id])}}">{{$admin->name}}</a>
                    </div>
                    <div class="tag">
                        Tag
                    </div>
                </div>
            @endforeach
        </div>
        {{$admins->links()}}
    </div>
@endsection
