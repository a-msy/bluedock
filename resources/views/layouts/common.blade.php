<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
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
    @yield('addjsHEAD')
</head>
<body>
@yield('header')
<div id="app">
    @yield('content')
</div>
@yield('footer')
<script src="{{asset('js/app.js')}}"></script>
@yield('addjs')
</body>
</html>
