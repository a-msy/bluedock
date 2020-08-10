@extends('layouts.common')
@include('layouts.master.header')
@section('content')
    <section class="container">
        <textarea name="hoge"></textarea>
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
