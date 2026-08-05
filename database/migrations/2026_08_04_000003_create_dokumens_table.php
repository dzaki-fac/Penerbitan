<?php

use App\Enums\DokumenStatus;
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
        Schema::create('dokumens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('naskah_id')->constrained()->cascadeOnDelete();
            $table->string('nama_dokumen');
            $table->string('file_path')->nullable();
            $table->enum('status', array_column(DokumenStatus::cases(), 'value'))
                ->default(DokumenStatus::Belum->value);
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumens');
    }
};
