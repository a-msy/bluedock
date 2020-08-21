@extends('layouts.admin.app')
@section('content')
    @include('share.admin.edit',['data'=>$data,'profile_action'=>route('admin.profile.update'),'logo_action'=>route('admin.profile.upload.logo'),'background_action'=>route('admin.profile.upload.background'),'eyecatch_action'=>route('admin.profile.upload.eyecatch')])
@endsection
