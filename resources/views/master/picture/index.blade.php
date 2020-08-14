@extends('layouts.master_common')
@include('layouts.master.header')
@section('content')
    <section class="container">
        <div class="row">
            @foreach($pictures as $picture)
                <div class="col-md-4 mb-3">
                    <img src="{{asset('/storage/img/article_pictures/thumb/'.$picture->filename)}}"
                         alt="{{$picture->alt}}"
                         style="width:100%">
                    <form action="{{route('master.picture.edit.alt')}}" method="post" class="form-inline">
                        @csrf
                        <input type="hidden" name="id" value="{{$picture->id}}">
                        <input type="text" value="{{$picture->alt}}" class="form-control">
                        <button type="submit" class="btn btn-primary">更新</button>
                    </form>
                    <form action="{{route('master.picture.delete')}}" method="POST">
                        @csrf
                        <input type="hidden" name="id" value="{{$picture->id}}">
                        <button type="submit" class="btn btn-danger">削除</button>
                    </form>
                </div>
            @endforeach
        </div>
        {{ $pictures->links() }}
    </section>
@endsection
@include('layouts.footer')

