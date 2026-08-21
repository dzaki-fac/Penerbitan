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
        Schema::table('workflow_histories', function (Blueprint $table) {
            $table->text('catatan')->nullable()->change();
        });

        Schema::table('isbns', function (Blueprint $table) {
            $table->text('catatan')->nullable()->change();
        });

        Schema::table('layouts', function (Blueprint $table) {
            $table->text('catatan_revisi')->nullable()->change();
        });

        Schema::table('revisi_uploads', function (Blueprint $table) {
            $table->text('catatan_penulis')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workflow_histories', function (Blueprint $table) {
            $table->string('catatan')->nullable()->change();
        });

        Schema::table('isbns', function (Blueprint $table) {
            $table->string('catatan')->nullable()->change();
        });

        Schema::table('layouts', function (Blueprint $table) {
            $table->string('catatan_revisi')->nullable()->change();
        });

        Schema::table('revisi_uploads', function (Blueprint $table) {
            $table->string('catatan_penulis')->nullable()->change();
        });
    }
};
