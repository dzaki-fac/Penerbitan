<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis_identitas', ['nim', 'nip']);
            $table->string('nomor_identitas');
            $table->string('email')->nullable();
            $table->timestamps();

            $table->unique(['jenis_identitas', 'nomor_identitas']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authors');
    }
};
