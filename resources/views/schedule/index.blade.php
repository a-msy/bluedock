@extends('layouts.common')
@section('addcss')
    <link rel="stylesheet" href="{{asset('fullcalendar/main.min.css')}}"
@endsection
@section('addjs')
    <script src="{{asset('fullcalendar/main.min.js')}}"></script>
    <script src="{{asset('fullcalendar/locales-all.min.js')}}"></script>
    <script src="{{asset('fullcalendar/ja.js')}}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var calendarEl = document.getElementById('calendar');

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                editable: false,
                eventDurationEditable: false,
                selectLongPressDelay: 0,
                events: '/api/event_list',
                locale: 'ja',
            });
            calendar.render();
        });
    </script>
@endsection
@section('content')
    <div class="container">
        <div id='calendar'></div>
    </div>
@endsection
{{-- https://tech.arms-soft.co.jp/entry/2017/02/14/154000 --}}
{{-- https://qiita.com/imp555sti/items/ee9809768f6dc9439ab5 --}}
{{-- https://fullcalendar.io/docs/initialize-globals --}}


{{-- eventDidMount: function(info) {
                    $(info.el).tooltip({
                        title: info.event.extendedProps.description,
                        placement: "top",
                        trigger: "hover",
                        container: "body"
                    });
                },
--}}
