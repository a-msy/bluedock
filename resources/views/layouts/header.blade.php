<header style="border-bottom: solid 1px var(--themecolor);">
    <nav class="navbar navbar-light bg-white position-relative py-3">
        <button class="navbar-toggler position-absolute" type="button"
                data-toggle="collapse"
                data-target="#navmenu1"
                aria-controls="navmenu1"
                aria-expanded="false"
                aria-label="Toggle navigation" style="z-index:99; border-color:transparent; top:10px;">
            <span class="navbar-toggler-icon"></span>
        </button>
        <a href="{{route('home')}}" class="navbar-brand m-auto">Bluedock</a>
        <div class="collapse navbar-collapse" id="navmenu1">
            <div class="navbar-nav">
                <a class="nav-item nav-link" href="{{route('event.index')}}">イベント一覧</a>
                <a class="nav-item nav-link" href="{{route('schedule.index')}}">スケジュール</a>
                <a class="nav-item nav-link" href="{{route('article.index')}}">記事一覧</a>
                <a class="nav-item nav-link" href="{{route('admin.index')}}">バンド一覧</a>
                <a class="nav-item nav-link" href="{{route('house.index')}}">ライブハウス一覧</a>
            </div>
        </div>
    </nav>
</header>
