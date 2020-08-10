@extends('layouts.common')
@include('layouts.master.header')
@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">{{ __('Master') }}</div>

                    <div class="card-body">
                        @if (session('status'))
                            <div class="alert alert-success" role="alert">
                                {{ session('status') }}
                            </div>
                        @endif

                        <a href="{{route('master.picture.input')}}">画像追加</a>
                        <a href="{{route('master.picture.index')}}">画像一覧</a>
                        <a href="{{route('master.article.create')}}">記事作成</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@include('layouts.footer')
