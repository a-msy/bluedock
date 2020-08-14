@extends('layouts.master_common')
@include('layouts.master.header')
@section('content')
    <div class="container">
        <h2>タグ登録</h2>
        <form action="{{route('master.tag.create')}}" method="POST">
            @csrf
            <label for="name">
                タグ名
            </label>
            <input name="name" id="name" type="text" required class="form-control">
            <button type="submit" class="btn btn-info">保存</button>
        </form>
        <h1>タグ一覧</h1>
        <table class="table table-hover">
            <thead>
            <tr>
                <th scope="col">id</th>
                <th scope="col">タグ名</th>
            </tr>
            </thead>
            <tbody>
            @foreach($tags as $tag)
                <tr>
                    <th scope="row">{{$tag->id}}</th>
                    <td>{{$tag->name}}</td>
                </tr>
            @endforeach
            </tbody>
            <tfoot>
            <tr>
                {{ $tags->links() }}
            </tr>
            </tfoot>
        </table>
    </div>
@endsection
@include('layouts.footer')
