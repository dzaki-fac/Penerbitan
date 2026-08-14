<?php

use App\Enums\NaskahStatus;
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
        Schema::create('naskahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->string('link_cover')->nullable();
            $table->date('tanggal_pengajuan');
            $table->string('sumber_form')->nullable();
            $table->string('status', 50)->default(NaskahStatus::DataDiterima->value);
            $table->unsignedTinyInteger('progress')->default(NaskahStatus::DataDiterima->progress());
            $table->text('catatan_admin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('naskahs');
    }
};