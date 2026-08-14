<?php

use App\Enums\IsbnStatus;
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
        Schema::create('isbns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('naskah_id')->constrained()->cascadeOnDelete();
            $table->string('nomor_isbn')->nullable();
            $table->string('penerbit')->nullable();
            $table->string('status', 50)
                ->default(IsbnStatus::Proses->value);
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('isbns');
    }
};
