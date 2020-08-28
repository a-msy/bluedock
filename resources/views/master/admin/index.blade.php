@extends('layouts.master_common')
@section('content')
    <div class="container">
        <table class="table">
            <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">バンド名</th>
                <th scope="col">メールアドレス</th>
                <th scope="col">課金状況</th>
                <th scope="col">作成日</th>
            </tr>
            </thead>
            <tbody>
            @foreach($admins as $admin)
                <tr>
                    <th scope="row">{{$admin->id}}</th>
                    <td><a href="{{route('master.admin.edit',['admin'=>$admin->id])}}">{{$admin->name}}</a></td>
                    <td>{{$admin->email}}</td>
                    <td>{{config('const.Subscription.'.$admin->subscription)}}</td>
                    <td>{{$admin->created_at}}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
        {{$admins->links()}}
    </div>
@endsection
