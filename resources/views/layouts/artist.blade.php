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
