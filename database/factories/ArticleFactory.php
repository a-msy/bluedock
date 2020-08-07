<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Article;
use Faker\Generator as Faker;

$factory->define(Article::class, function (Faker $faker) {
    return [
        //
        'title'=>$faker->text(128),
        'body'=>$faker->text(1000),
        'type'=>$faker->numberBetween(0,5)
    ];
});
