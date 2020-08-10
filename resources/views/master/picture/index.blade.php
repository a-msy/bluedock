@extends('layouts.common')
@include('layouts.master.header')
@section('content')
    <section class="container">
        <div class="row">
            @foreach($pictures as $picture)
                <div class="col-md-4 mb-3">
                    <img src="{{asset('/storage/img/article_pictures/'.$picture->filename)}}" alt="{{$picture->alt}}" style="width:100%">
                    <p>{{$picture->alt}}</p>
                    <form action="{{route('master.picture.delete')}}" method="POST">
                        @csrf
                        <input type="hidden" name="id" value="{{$picture->id}}">
                        <button type="submit" class="btn btn-danger">削除</button>
                    </form>
                </div>
            @endforeach
        </div>
    </section>
@endsection
@include('layouts.footer')

