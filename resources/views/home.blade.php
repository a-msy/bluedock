@extends('layouts.common')
@section('content')
    <section class="index-top">
        <!-- Slider main container -->
        <div class="swiper-container sw" style="height: 100%;">
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
    @include('layouts.section-header',['title'=>'INTERVIEW',])
    <section class="interview overflow-hidden">
        @include('layouts.swiper',['articles'=>$interview_articles,'number'=>2])
    </section>
    @include('layouts.more',['text'=>'MORE','url'=>'/'])
    <section class="background-black overflow-hidden popular">
        {{--        TODO::人気順記事を取得するロジックを組む--}}
        @include('layouts.section-header',['title'=>'POPULAR','addcss'=>"text-white",'addstyle'=>"",'addstyle2'=>"border-color:white !important;"])
        @include('layouts.swiper',['articles'=>$top_articles,'number'=>3])
    </section>
    @include('layouts.section-header',['title'=>'NEWS',])
    @include('layouts.news',['articles'=>$news_articles])
    @include('layouts.more',['text'=>'MORE','url'=>'/'])

    @include('layouts.section-header',['title'=>'COLUMN',])
    @include('layouts.news',['articles'=>$column_articles])
    @include('layouts.more',['text'=>'MORE','url'=>'/'])

    @include('layouts.section-header',['title'=>'Pics Ranking',])
    <p class="text-center m-5">準備中</p>

    @include('layouts.section-header',['title'=>'ARTIST',])
    <section class="container">
        <div class="row">
            @foreach($artists as $artist)
                <div class="col-4 py-3 artist-cell">
                    <img src="{{asset('storage/img/shares/artist/eyecatch/'.$artist->eyecatch)}}"
                         class="object-fit background-theme">
                </div>
            @endforeach
        </div>
    </section>
@endsection
@section('addjs')
    <script>
        $(document).ready(function () {
            var mySwiper1 = new Swiper('.sw', {
                effect: "slide",
                loop: true,
                slidesPerView: 1,
                spaceBetween: 0,
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                    }
                },
                centeredSlides: true,
                pagination: '.swiper-pagination',
            })
            var mySwiper2 = new Swiper('.sw-2', {
                effect: "slide",
                loop: true,
                slidesPerView: 2,
                spaceBetween: 5,
                breakpoints: {
                    768: {
                        slidesPerView: 4,
                    }
                },
                pagination: '.sp-2',
            })
            var mySwiper2 = new Swiper('.sw-3', {
                effect: "slide",
                loop: true,
                slidesPerView: 2,
                spaceBetween: 5,
                breakpoints: {
                    768: {
                        slidesPerView: 4,
                    }
                },
                pagination: '.sp-3',
            })
        });
    </script>
@endsection
