<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAdminsColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('admins', function (Blueprint $table) {
            //
            $table->string('website')->nullable();
            $table->string('Twitter')->nullable();
            $table->string('Instagram')->nullable();
            $table->string('Facebook')->nullable();
            $table->integer('subscription')->default(0);
            $table->text('profile')->nullable();
            $table->string('eyecatch')->nullable();
            $table->string('background')->nullable();
            $table->string('logo')->nullable();
            $table->string('katakana')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('admins', function (Blueprint $table) {
            //
        });
    }
}
