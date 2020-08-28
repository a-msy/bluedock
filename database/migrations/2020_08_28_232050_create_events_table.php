<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->dateTime('when')->nullable();
            $table->bigInteger('where')->nullable();//house_id
            $table->text('comment')->nullable();
            $table->string('eyecatch')->nullable();
            $table->string('flyer')->nullable();
            $table->dateTime('open')->nullable();
            $table->dateTime('start')->nullable();
            $table->integer('door')->nullable();
            $table->integer('adv')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
