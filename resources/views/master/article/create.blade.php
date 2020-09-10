@extends('layouts.master_common')
@section('addjs')
    <script src="{{asset('vendor/laravel-filemanager/js/stand-alone-button.js')}}"></script>
    <script>
        var route_prefix = "{{url('master/lfm')}}";
        $('#lfm').filemanager('image', '/storage/img/', {prefix: route_prefix});
    </script>
    <script src="{{asset('ckeditor/ckeditor.js')}}"></script>
    <script src="{{asset('ckeditor/adapters/jquery.js')}}"></script>
    <script type="text/javascript">
        CKEDITOR.replace('editor1', {
            {{--filebrowserBrowseUrl: '{{url('master/lfm')}}',--}}
            {{--filebrowserImageBrowseUrl: '{{url('master/lfm')}}',--}}
        });
    </script>
    <script src="{{asset('js/jquery-ui.min.js')}}"></script>
    <script src="{{asset('js/tag-it.min.js')}}"></script>
    <script>
        $.ajax({
            url: '{{route('api.tag_list')}}',
            dataType: 'json',
            success: function (data) {
                $('#tag-input').tagit({
                    availableTags: data
                })
            }
        });
    </script>
    <script>
        $.ajax({
            url: '{{route('api.admin_tag')}}',
            dataType: 'json',
            success: function (data) {
                $('#admin-input').tagit({
                    availableTags: data
                })
            }
        });
    </script>
@endsection
@section('addcss')
    <link rel="stylesheet" href="{{asset('css/jquery-ui.min.css')}}">
    <link rel="stylesheet" href="{{asset('css/tagit.ui-zendesk.css')}}">
    <link rel="stylesheet" href="{{asset('css/jquery.tagit.css')}}">
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
                              class="ckeditor" required> @isset($article){{$article->body}}@endisset </textarea>
                </div>
                <div class="col-2">
                    <div class="form-group">
                        <label>アイキャッチ画像</label>
                        <div style="height:150px; width: 100%; overflow: hidden;" id="holder">
                        </div>
                        <div class="input-group">
                            <span class="input-group-btn">
                                <a id="lfm" data-input="thumbnail" data-preview="holder"
                                   class="btn btn-primary">画像選択</a>
                                <input id="thumbnail" class="form-control" type="text" name="file_path" @isset($article) value="{{$article->eyecatch}}" @endisset>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>記事タイプ</label>
                        <select name="type" class="form-control">
                            @foreach(config('const.ArticleTYPE') as $key=>$type)
                                <option value="{{$key}}"
                                        @if(isset($article) == true) @if($article->type == $key) selected
                                        @endif @elseif($key == 0 ) selected @endif >{{$type}}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label>タグ（タグ一覧にないタグは保存されません）</label>
                        <input type="text" @isset($article) value=" @foreach($article->tags as $tag) {{$tag->name.'%'.$tag->id}}, @endforeach " @endisset name="tags" id="tag-input">
                    </div>
                    <div class="form-group">
                        <label>アーティストタグ（登録されていないアーティストは保存されません）</label>
                        <input type="text" @isset($article) value=" @foreach($article->admins as $admin) {{$admin->name.'%'.$admin->id}}, @endforeach " @endisset name="admins" id="admin-input">
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-info">保存</button>
                    </div>
                </div>
            </div>
        </section>
    </form>
@endsection
