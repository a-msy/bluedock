@extends('layouts.master_common')
@include('layouts.master.header')
@section('content')
    <form action="{{route('master.article.save')}}" method="post">
        <section class="container">
            <div class="row">
                <div class="col-10">
                    @csrf
                    @isset($article)
                        <input type="hidden" name="id" value="{{$article->id}}">
                    @endisset
                    <input type="text" name="title" placeholder="タイトルを入力" class="form-control mb-5"
                           @isset($article) value="{{$article->title}}" @endisset>
                    <textarea name="body"> @isset($article){{$article->body}}@endisset </textarea>
                </div>
                <div class="col-2">
                    <div class="form-group">
                        <select name="type" class="form-control">
                            @foreach(config('const.ArticleTYPE') as $key=>$type)
                                <option value="{{$key}}" @if(isset($article) == true) @if($article->type == $key) selected @endif @elseif($key == 0 ) selected @endif >{{$type}}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-info">保存</button>
                    </div>
                    <div class="form-group">
                        <label>この記事に関連する画像</label>

                    </div>
                </div>
            </div>
        </section>
    </form>
@endsection
@include('layouts.footer')
@section('addjsHEAD')
    <script src="{{asset('js/tinymce/tinymce.min.js')}}"></script>
    <script>
        tinymce.init({
            selector: "textarea",  // change this value according to your HTML
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount', 'image', 'n1ed'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright | bullist numlist | ' +
                'removeformat | image',
            language: "ja",
            image_list: "{{route('image_list')}}",
            apiKey: "0NEHDFLT",
        });
    </script>
@endsection
