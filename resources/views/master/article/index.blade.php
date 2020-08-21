@extends('layouts.master_common')
@section('content')
    <div class="container">
        <h1>記事一覧</h1>
        <table class="table table-hover">
            <thead>
            <tr>
                <th scope="col">id</th>
                <th scope="col">タイトル</th>
                <th scope="col">記事タイプ</th>
                <th scope="col">作成日</th>
                <th scope="col">最終更新日</th>
            </tr>
            </thead>
            <tbody>
            @foreach($articles as $article)
                <tr>

                    <th scope="row">{{$article->id}}</th>
                    <td><a href="{{route('master.article.edit',['id'=>$article->id])}}">{{$article->title}}</a></td>
                    <td>{{$article->type}}</td>
                    <td>{{$article->created_at}}</td>
                    <td>{{$article->updated_at}}</td>
                </tr>
            @endforeach
            </tbody>
            <tfoot>
            <tr>
                {{ $articles->links() }}
            </tr>
            </tfoot>
        </table>
    </div>
@endsection
