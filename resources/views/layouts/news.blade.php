<section class="container overflow-hidden">
    <div class="row">
        @foreach($articles as $article)
            <div class="col-md-12 py-4 news-cell d-flex overflow-hidden">
                <div class="background-theme flex-grow-1 news-cell-img">
                    <img class="object-fit"
                         src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}">
                </div>
                <div class="d-flex flex-column pl-3 news-cell-content">
                    <h2 class="font-size-14px">{{$article->title}}</h2>
                    <p class="text-lightgrey">{{strip_tags(mb_strimwidth($article->body,0,70,"...")) }}</p>
                    <p class="mt-auto mb-0 text-right font-size-14px">{{$article->created_at->format('m/d')}}</p>
                </div>
            </div>
        @endforeach
    </div>
</section>
