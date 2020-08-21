@section('addjs')
    <script src="{{asset('ckeditor/ckeditor.js')}}"></script>
    <script src="{{asset('ckeditor/adapters/jquery.js')}}"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            CKEDITOR.replace('profile');
        });
    </script>
@endsection
@section('addcss')
    <style>
        #cke_19,#cke_25,#cke_32{ display: none }
    </style>
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
    <form action="{{$profile_action}}" method="POST">
        @csrf
        <textarea id="profile" class="ckeditor" name="profile"></textarea>
    </form>
</section>
