<header>
    <nav class="navbar navbar-dark bg-dark">
        <a href="#" class="navbar-brand">Title</a>
        <button class="navbar-toggler" type="button"
                data-toggle="collapse"
                data-target="#navmenu1"
                aria-controls="navmenu1"
                aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navmenu1">
            <div class="navbar-nav">
                <a class="nav-item nav-link" href="{{route('event.index')}}">イベント一覧</a>
                <a class="nav-item nav-link" href="{{route('schedule.index')}}">スケジュール</a>
                <a class="nav-item nav-link" href="{{route('article.index')}}">記事一覧</a>
            </div>
        </div>
    </nav>
</header>
