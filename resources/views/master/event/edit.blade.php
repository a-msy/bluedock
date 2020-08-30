@extends('layouts.master_common')
@section('addjsHEAD')
    <link href="{{asset('css/tempusdominus-bootstrap-4.min.css')}}">
    <script src="{{asset('ckeditor/ckeditor.js')}}"></script>
    <script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/js/all.min.js"
        integrity="sha256-MAgcygDRahs+F/Nk5Vz387whB4kSK9NXlDN3w58LLq0="
        crossorigin="anonymous"></script>
@endsection
@section('addjs')
    <script src="{{asset('ckeditor/adapters/jquery.js')}}"></script>
    <script type="text/javascript">
        CKEDITOR.replace('comment', {
            filebrowserBrowseUrl: '{{url('master/lfm')}}',
            filebrowserImageBrowseUrl: '{{url('master/lfm')}}',
        });
    </script>
    <script src="{{asset('js/moment.min.js')}}"></script>
    <script src="{{asset('js/moment-with-locales.min.js')}}"></script>
    <script src="{{asset('js/tempusdominus-bootstrap-4.min.js')}}"></script>
    <script type="text/javascript">
        $(function () {
            $('#when').datetimepicker({
                locale: 'ja',
            });
            $('#open').datetimepicker({
                locale: 'ja',
            });
            $('#start').datetimepicker({
                locale: 'ja',
            });
        });
    </script>
@endsection
@section('content')
    <section class="container">
        @isset($event)
            <div class="accordion" id="accordion-4">
                <div class="card">
                    <div class="card-header" id="header-4a">
                        <button class="btn btn-link" type="button"
                                data-toggle="collapse" data-target="#card-4a"
                                aria-expanded="true" aria-controls="card-4a">
                            フライヤー画像
                        </button>
                    </div>
                    <div id="card-4a" class="collapse"
                         aria-labelledby="header-4a" data-parent="#accordion-4">
                        <div class="card-body">
                            <img src="{{asset('storage/img/shares/event/flyer/'.$event->flyer)}}">
                            <form class="mb-3" action="{{route('master.event.flyer')}}" method="POST" enctype="multipart/form-data">
                                @csrf
                                <input type="hidden" name="id" value="{{$event->id}}">
                                <div>
                                    <input type="file" name="flyer" class="form-control" required>
                                    <p class="small">*jpg,png形式 4096KB以下</p>
                                    <p class="small">*画像はリサイズされます</p>
                                </div>
                                <button type="submit" class="btn btn-primary">アップロード</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header" id="header-4b">
                        <button class="btn btn-link" type="button"
                                data-toggle="collapse" data-target="#card-4b"
                                aria-expanded="false" aria-controls="card-4b">
                            アイキャッチ画像
                        </button>
                    </div>
                    <div id="card-4b" class="collapse"
                         aria-labelledby="header-4b" data-parent="#accordion-4">
                        <div class="card-body">
                            <img src="{{asset('storage/img/shares/event/eyecatch/'.$event->eyecatch)}}">
                            <form action="{{route('master.event.eyecatch')}}" method="POST" enctype="multipart/form-data">
                                @csrf
                                <input type="hidden" name="id" value="{{$event->id}}">
                                <div>
                                    <input type="file" name="eyecatch" class="form-control" required>
                                    <p class="small">*jpg,png形式 4096KB以下</p>
                                    <p class="small">*画像はリサイズされます</p>
                                </div>
                                <button type="submit" class="btn btn-primary">アップロード</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @endisset
        <form action="{{route('master.event.store')}}" method="POST" class="mt-3">
            @csrf
            <h2>イベント情報</h2>

            @isset($event)
                <input type="hidden" name="id" value="{{$event->id}}">
            @endisset

            <div class="form-group">
                <label>タイトル</label>
                <input class="form-control" @isset($event) value="{{$event->title}}" @endisset name="title" required>
            </div>
            <div class="form-group">
                <label>開催日</label>
                <div class="input-group date" id="when" data-target-input="nearest">
                    <div class="input-group-append" data-target="#when" data-toggle="datetimepicker">
                        <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                        <input type="text" class="form-control datetimepicker-input" data-target="#when" name="when"
                               @isset($event) value="{{$event->when}}" @endisset>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>開催場所</label>
                <select name="where" class="form-control">
                    @foreach($admins as $admin)
                        <option value="{{$admin->id}}"
                                @isset($event) @if($admin->id == $event->where) selected @endif @endisset>{{$admin->name}}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group">
                <label>詳細</label>
                <textarea name="comment" id="comment">@isset($event){{$event->comment}}@endisset</textarea>
            </div>
            <div class="form-group">
                <label>OPEN</label>
                <div class="input-group date" id="open" data-target-input="nearest">
                    <div class="input-group-append" data-target="#open" data-toggle="datetimepicker">
                        <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                        <input type="text" class="form-control datetimepicker-input" data-target="#open" name="open"
                               @isset($event) value="{{$event->open}}" @endisset>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>START</label>
                <div class="input-group date" id="start" data-target-input="nearest">
                    <div class="input-group-append" data-target="#start" data-toggle="datetimepicker">
                        <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                        <input type="text" class="form-control datetimepicker-input" data-target="#start" name="start"
                               @isset($event) value="{{$event->start}}" @endisset>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>DOOR</label>
                <input class="form-control" name="door" @isset($event) value="{{$event->door}}" @endisset type="number">
            </div>
            <div class="form-group">
                <label>ADV</label>
                <input class="form-control" name="adv" @isset($event) value="{{$event->adv}}" @endisset type="number">
            </div>
            <button type="submit" class="btn btn-primary">保存</button>
        </form>
    </section>
@endsection
