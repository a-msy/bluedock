@extends('layouts.common')
@section('content')
    <section class="index-top">
        <!-- Slider main container -->
        <div class="swiper-container" style="height: 100%">
            <!-- Additional required wrapper -->
            <div class="swiper-wrapper">
                <!-- Slides -->
                @foreach($top_articles as $key => $top_article)
                    <div class="swiper-slide index-top-slide position-relative">
                        <h2 class="position-absolute text-white px-2"><span
                                class="background-theme p-1">{{$top_article->title}}</span></h2>
                        <img src="{{asset('storage/img/article_pictures/'.$top_article->eyecatch)}}"
                             class="object-fit"/>
                    </div>
                @endforeach
            </div>
            <!-- If we need pagination -->
            <div class="swiper-pagination"></div>
            <!-- If we need navigation buttons -->
            {{--            <div class="swiper-button-prev"></div>--}}
            {{--            <div class="swiper-button-next"></div>--}}
        </div>
    </section>
    @include('layouts.section-header',['title'=>'INTERVIEW'])
    <section class="interview overflow-hidden">
        <!-- Slider main container -->
        <div class="swiper-container2 mt-4" style="height: 100%">
            <!-- Additional required wrapper -->
            <div class="swiper-wrapper">
                <!-- Slides -->
                @foreach($articles as $key => $article)
                    <div class="swiper-slide position-relative overflow-hidden">
                        <p class="position-absolute px-2" style="z-index: 2"><span
                                class="background-white p-1">{{mb_strimwidth($article->title,0,45,"...")}}</span></p>
                        <img src="{{asset('storage/img/article_pictures/'.$article->eyecatch)}}"
                             class="object-fit position-absolute"
                             style="z-index: 1; left: 10px; top:10px; background: var(--themecolor);"/>
                    </div>
                @endforeach
            </div>
            <!-- If we need pagination -->
            <div class="swiper-pagination2"></div>
            <!-- If we need navigation buttons -->
            {{--            <div class="swiper-button-prev2"></div>--}}
            {{--            <div class="swiper-button-next2"></div>--}}
        </div>
    </section>
    @include('layouts.more',['text'=>'MORE','url'=>'/'])
@endsection
@section('addjs')
    <script>

        var mySwiper1 = new Swiper('.swiper-container', {
            effect: "slide",
            loop: true,
            slidesPerView: 1,
            spaceBetween: 0,
            breakpoints:{
              768:{
                  slidesPerView: 2,
              }
            },
            centeredSlides: true,
            pagination: '.swiper-pagination',
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
        })
        var mySwiper2 = new Swiper('.swiper-container2', {
            effect: "slide",
            loop: true,
            slidesPerView: 2,
            spaceBetween: 20,
            breakpoints:{
                768:{
                    slidesPerView: 4,
                }
            },
            pagination: '.swiper-pagination2',
            nextButton: '.swiper-button-next2',
            prevButton: '.swiper-button-prev2',
        })

    </script>
@endsection
