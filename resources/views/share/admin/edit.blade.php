@section('addjsHEAD')
    <script src="{{asset('ckeditor/ckeditor.js')}}"></script>
@endsection
@section('addjs')
    <script src="{{asset('ckeditor/adapters/jquery.js')}}"></script>
    <script type="text/javascript">
        CKEDITOR.config.customConfig = '/ckeditor/adminconfig.js';
        CKEDITOR.replace('profile');
    </script>
@endsection
<section class="container">
    <div class="accordion" id="accordion-4">
        <div class="card">
            <div class="card-header" id="header-4a">
                <button class="btn btn-link" type="button"
                        data-toggle="collapse" data-target="#card-4a"
                        aria-expanded="true" aria-controls="card-4a">
                    ロゴ画像
                </button>
            </div>
            <div id="card-4a" class="collapse"
                 aria-labelledby="header-4a" data-parent="#accordion-4">
                <div class="card-body">
                    <form class="mb-3" action="{{$logo_action}}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="id" value="{{$data->id}}">
                        <div>
                            <input type="file" name="logo" class="form-control" required>
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
                    <form action="{{$eyecatch_action}}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="id" value="{{$data->id}}">
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
        <div class="card">
            <div class="card-header" id="header-4c">
                <button class="btn btn-link" type="button"
                        data-toggle="collapse" data-target="#card-4c"
                        aria-expanded="false" aria-controls="card-4c">
                    背景画像
                </button>
            </div>
            <div id="card-4c" class="collapse"
                 aria-labelledby="header-4c" data-parent="#accordion-4">
                <div class="card-body">
                    <form action="{{$background_action}}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" name="id" value="{{$data->id}}">
                        <div>
                            <input type="file" name="background" class="form-control" required>
                            <p class="small">*jpg,png形式 4096KB以下</p>
                            <p class="small">*画像はリサイズされます</p>
                        </div>
                        <button type="submit" class="btn btn-primary">アップロード</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <form action="{{$profile_action}}" method="POST" class="mt-3">
        @csrf
        <input type="hidden" name="id" value="{{$data->id}}">
        <div class="form-group">
            <label>バンド名</label>
            <input class="form-control" value="{{$data->name}}" name="name" required>
        </div>
        <div class="form-group">
            <label>メールアドレス</label>
            <input class="form-control" value="{{$data->email}}" name="email" required>
        </div>
        <div class="form-group">
            <label>プロフィール</label>
            <textarea id="profile" class="ckeditor" name="profile">{{$data->profile}}</textarea>
        </div>
        <div class="form-group">
            <label>ウェブサイト</label>
            <input class="form-control" name="website" value="{{$data->website}}" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label>Twitter</label>
            <input class="form-control" name="twitter" value="{{$data->Twitter}}" placeholder="@twitter_jp">
        </div>
        <div class="form-group">
            <label>Instagram</label>
            <input class="form-control" name="instagram" value="{{$data->Instagram}}" placeholder="in_stagram">
        </div>
        <div class="form-group">
            <label>Facebook</label>
            <input class="form-control" name="facebook" value="{{$data->Facebook}}" placeholder="face_book">
        </div>
        <button type="submit" class="btn btn-primary">保存</button>
    </form>
</section>
