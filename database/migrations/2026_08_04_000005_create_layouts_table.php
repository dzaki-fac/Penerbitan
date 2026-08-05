<?php

use App\Enums\LayoutStatus;
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
        Schema::create('layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('naskah_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('versi')->default(1);
            $table->string('file_layout')->nullable();
            $table->string('preview_pdf_link')->nullable();
            $table->enum('status', array_column(LayoutStatus::cases(), 'value'))
                ->default(LayoutStatus::MenungguReview->value);
            $table->string('catatan_revisi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('layouts');
    }
};
