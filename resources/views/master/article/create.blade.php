@extends('layouts.common')
@include('layouts.master.header')
@section('content')
    <section class="container">
        <form action="{{route('master.article.save')}}" method="post">
            @csrf
            <input type="text" name="title" placeholder="title" class="form-control">
            <textarea name="body"></textarea>
            <select name="type">
                <option value="0">非公開</option>
                <option value="1">公開</option>
            </select>
            <button type="submit" class="btn btn-info">保存</button>
        </form>
    </section>
@endsection
@include('layouts.footer')
@section('addjsHEAD')
    <script src="{{asset('js/tinymce/tinymce.min.js')}}"></script>
    <script>
        tinymce.init({
            selector: "textarea",  // change this value according to your HTML
            plugins: "image",
            menubar: "insert",
            toolbar: "image",
            image_list: "{{route('image_list')}}"
        });
    </script>
@endsection
