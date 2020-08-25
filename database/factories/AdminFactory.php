<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Model;
use App\Models\Admin;
use Faker\Generator as Faker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

$factory->define(Admin::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => Hash::make('12345678'), // password
        'remember_token' => Str::random(10),
        'website'=>'www.google.com',
        'Twitter'=>'@5r25_',
        'Facebook'=>'imadamasaya',
        'Instagram'=>'intagram',
        'subscription'=>0,
        'profile'=>$faker->text(128)
    ];
});
