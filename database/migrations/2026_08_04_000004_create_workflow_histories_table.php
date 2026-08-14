<?php

use App\Enums\AktorType;
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
        Schema::create('workflow_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('naskah_id')->constrained()->cascadeOnDelete();
            $table->string('dari_status', 50)->nullable();
            $table->string('ke_status', 50);
            $table->enum('aktor', array_column(AktorType::cases(), 'value'));
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_histories');
    }
};
