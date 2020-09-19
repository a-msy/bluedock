<!-- Slider main container -->
<div class="swiper-container{{$number}} mt-4" style="height:inherit;">
    <!-- Additional required wrapper -->
    <div class="swiper-wrapper">
        <!-- Slides -->
        @foreach($articles as $key => $article)
            <div class="swiper-slide position-relative overflow-hidden">
                <h2 class="position-absolute px-2" style="z-index: 2; line-height: 0.5;"><span
                        class="background-white p-1">{{mb_strimwidth($article->title,0,65,"...")}}</span></h2>
                <img src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}"
                     class="object-fit position-absolute"
                     style="z-index: 1; left: 10px; top:10px; background: var(--themecolor);"/>
            </div>
        @endforeach
    </div>
    <!-- If we need pagination -->
    <div class="swiper-pagination{{$number}}"></div>
