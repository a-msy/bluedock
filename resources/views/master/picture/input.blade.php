@extends('layouts.common')
@include('layouts.master.header')
@section('content')
    <section class="container">
        @if ($errors->any())
            <div class="alert alert-danger">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        @if(\Session::has('picture'))
            <img style="width:100%;" src="{{ asset('/storage/img/article_pictures/'.\Session('picture')->filename) }}" alt="{{\Session('picture')->alt}}">
        @endif
        <form action="{{ route('master.picture.upload') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label>画像ファイル</label>
                <input type="file" class="form-control" name="image_file" required>
            </div>
            <div class="form-group">
                <label>キャプション</label>
                <input type="text" class="form-control" name="alt" required maxlength="255">
            </div>
            <button class="btn btn-success">追加</button>
        </form>
    </section>
@endsection
@include('layouts.footer')
