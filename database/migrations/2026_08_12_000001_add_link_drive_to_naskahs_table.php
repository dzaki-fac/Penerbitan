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
            $table->string('link_drive')->nullable()->after('catatan_admin');
        });

        Schema::table('revisi_uploads', function (Blueprint $table) {
            $table->string('file_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->dropColumn('link_drive');
        });

        Schema::table('revisi_uploads', function (Blueprint $table) {
            $table->string('file_path')->change();
        });
    }
};