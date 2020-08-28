<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\House;
use Faker\Generator as Faker;

$factory->define(House::class, function (Faker $faker) {
    return [
        //
        'name'=>$faker->city,
        'addr'=>$faker->address,
        'access'=>$faker->text(128),
        'contact'=>$faker->phoneNumber,
        'website'=>$faker->url,
        'capacity'=>$faker->numberBetween(0,10000),
        'parking'=>$faker->numberBetween(0,1)
    ];
});
