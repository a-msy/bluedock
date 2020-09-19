@extends('layouts.common')
@section('content')
    <section class="index-top">
        <!-- Slider main container -->
        <div class="swiper-container" style="height: 100%;">
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
    @include('layouts.section-header',[
    'title'=>'INTERVIEW',
    'addcss'=>"",
    'addstyle'=>"",
    'addstyle2'=>""
    ])
    <section class="interview overflow-hidden">
        @include('layouts.swiper',['articles'=>$articles,'number'=>2])
    </section>
    @include('layouts.more',['text'=>'MORE','url'=>'/'])
    <section class="background-black overflow-hidden popular">
        {{--        TODO::人気順記事を取得するロジックを組む--}}
        @include('layouts.section-header',[
    'title'=>'POPULAR',
    'addcss'=>"text-white",
    'addstyle'=>"",
    'addstyle2'=>"border-color:white !important;"
    ])
        @include('layouts.swiper',['articles'=>$articles,'number'=>3])
    </section>
    @include('layouts.section-header',[
        'title'=>'NEWS',
        'addcss'=>"",
        'addstyle'=>"",
        'addstyle2'=>""
    ])
    @include('layouts.news',['articles'=>$new_articles])
@endsection
@section('addjs')
    <script>
        var mySwiper1 = new Swiper('.swiper-container', {
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
        var mySwiper2 = new Swiper('.swiper-container2', {
            effect: "slide",
            loop: true,
            slidesPerView: 2,
            spaceBetween: 5,
            breakpoints: {
                768: {
                    slidesPerView: 4,
                }
            },
            pagination: '.swiper-pagination2',
        })
        var mySwiper2 = new Swiper('.swiper-container3', {
            effect: "slide",
            loop: true,
            slidesPerView: 2,
            spaceBetween: 5,
            breakpoints: {
                768: {
                    slidesPerView: 4,
                }
            },
            pagination: '.swiper-pagination2',
        })
    </script>
@endsection
