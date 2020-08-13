@extends('layouts.master_common')
@include('layouts.master.header')
@section('addjs')
    <style>
        .inline--1b5Cu {
            display: none;
        }
    </style>
    <script src="{{asset('vendor/laravel-filemanager/js/stand-alone-button.js')}}"></script>
    <script>
        var route_prefix = "{{url('master/lfm')}}";
        $('#lfm').filemanager('image', '/storage/img', {prefix: route_prefix});
    </script>
    <script src="{{asset('ckeditor/ckeditor.js')}}"></script>
    <script src="{{asset('ckeditor/adapters/jquery.js')}}"></script>
    <script type="text/javascript">
        CKEDITOR.replace('editor1', {
            filebrowserBrowseUrl: '{{url('master/lfm')}}',
            filebrowserImageBrowseUrl: '{{url('master/lfm')}}',
            filebrowserUploadUrl: '{{route('master.picture.upload')}}',
            filebrowserImageUploadUrl: '{{route('master.picture.upload')}}',
        });
    </script>
    {{--    TODO::画像アップロードをファイルマネージャからできるようにする--}}
@endsection
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
                    <textarea id=editor1 name="body"
                              class="ckeditor"> @isset($article){{$article->body}}@endisset </textarea>
                </div>
                <div class="col-2">
                    <div class="form-group">
                        <label>アイキャッチ画像</label>
                        <div style="height:150px; width: 100%; overflow: hidden;">
                            <img id="holder">
                        </div>
                        <div class="input-group">
                            <span class="input-group-btn">
                                <a id="lfm" data-input="thumbnail" data-preview="holder"
                                   class="btn btn-primary">画像選択</a>
                            </span>
                            <input id="thumbnail" class="form-control" type="text" name="filepath">
                        </div>
                    </div>
                    <div class="form-group">
                        <select name="type" class="form-control">
                            @foreach(config('const.ArticleTYPE') as $key=>$type)
                                <option value="{{$key}}"
                                        @if(isset($article) == true) @if($article->type == $key) selected
                                        @endif @elseif($key == 0 ) selected @endif >{{$type}}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-info">保存</button>
                    </div>
                </div>
            </div>
        </section>
    </form>
@endsection
@include('layouts.footer')
