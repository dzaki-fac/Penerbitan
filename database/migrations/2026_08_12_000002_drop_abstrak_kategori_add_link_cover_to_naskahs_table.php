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
        Schema::table('naskahs', function (Blueprint $table) {
            $table->string('link_cover')->nullable()->after('judul');
            $table->dropColumn(['abstrak', 'kategori']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->text('abstrak')->nullable()->after('judul');
            $table->string('kategori')->nullable()->after('abstrak');
            $table->dropColumn('link_cover');
        });
    }
};