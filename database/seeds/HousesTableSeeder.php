<?php

use App\Models\House;
use Illuminate\Database\Seeder;

class HousesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(House::class, 10)->create();
    }
}
