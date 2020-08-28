<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Model;
use App\Models\Event;
use Faker\Generator as Faker;

$factory->define(Event::class, function (Faker $faker) {
    return [
        //
        'title'=>$faker->sentence,
        'when'=>$faker->dateTime,
        'where'=>$faker->numberBetween(1,10),
        'comment'=>$faker->sentence,
        'open'=>$faker->dateTime,
        'start'=>$faker->dateTime,
        'door'=>1000,
        'adv'=>1500,
    ];
});
