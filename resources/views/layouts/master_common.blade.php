<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
{{--    <meta name="viewport" content="width=device-width, initial-scale=1">--}}
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @hasSection('title')
        <title>@yield('title')</title>
        <meta property="og:title" content="@yield('title')">
    @else
        <title></title>
        <meta property="og:title" content="">
    @endif

    <meta property="og:description" content="">
    <meta property="og:type" content="website">
    @hasSection('ogimage')
        @yield('ogimage')
    @else
        <meta property="og:image" content="">
    @endif
    <meta name="twitter:card" content="summary_large_image">
    @yield('addmeta')
<!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">
    <link rel="shortcut icon" href="{{asset('img/favicon.ico')}}">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- Styles -->
    <link href="{{ asset('css/app.css')}}" rel="stylesheet">
    <link href="{{ asset('css/style.css?'.now())}}" rel="stylesheet">
    @yield('addcss')
    <style>
        .container{
            max-width: 100% !important;
        }
    </style>
    @yield('addjsHEAD')
</head>
<body>
@include('layouts.master.header')
<div id="app" class="mt-3">
    <div class="row">
        <div class="col-2">
            @include('layouts.master.sidebar')
        </div>
        <div class="col-10">
            @yield('content')
        </div>
    </div>
</div>
@include('layouts.footer')
<script src="{{asset('js/app.js')}}"></script>
@yield('addjs')
</body>
</html>

