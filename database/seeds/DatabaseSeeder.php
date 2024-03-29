<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UsersTableSeeder::class,
            AdminsTableSeeder::class,
            MastersTableSeeder::class,
            ArticleTableSeeder::class,
            TagsTableSeeder::class,
            EventsTableSeeder::class,
            HousesTableSeeder::class
        ]);
    }
}
