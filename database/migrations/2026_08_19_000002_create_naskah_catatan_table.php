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
        Schema::create('naskah_catatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('naskah_id')->constrained()->cascadeOnDelete();
            $table->string('author_name');
            $table->text('isi');
            $table->string('target_type'); // 'general' or 'stage'
            $table->string('target_value')->nullable(); // stage value like 'verifikasi_dokumen', null for general
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('naskah_catatan');
    }
};
