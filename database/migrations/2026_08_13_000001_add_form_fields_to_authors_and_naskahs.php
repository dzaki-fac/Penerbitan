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
        Schema::table('authors', function (Blueprint $table) {
            $table->string('status')->nullable();
            $table->string('fakultas_sekolah')->nullable();
            $table->string('nomor_npwp')->nullable();
            $table->string('nomor_whatsapp')->nullable();
            $table->string('penulis_tambahan')->nullable();
        });

        Schema::table('naskahs', function (Blueprint $table) {
            $table->string('kebijakan_akses')->nullable();
            $table->string('biaya')->nullable();
            $table->string('nama_narahubung')->nullable();
            $table->string('nomor_whatsapp_narahubung')->nullable();
            $table->string('email_narahubung')->nullable();
            $table->text('link_dummy_upload')->nullable();
            $table->text('link_dummy_pdf')->nullable();
            $table->text('link_dummy_word')->nullable();
            $table->text('link_surat_keaslian')->nullable();
            $table->text('link_surat_penerbitan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->dropColumn([
                'kebijakan_akses',
                'biaya',
                'nama_narahubung',
                'nomor_whatsapp_narahubung',
                'email_narahubung',
                'link_dummy_upload',
                'link_dummy_pdf',
                'link_dummy_word',
                'link_surat_keaslian',
                'link_surat_penerbitan',
            ]);
        });

        Schema::table('authors', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'fakultas_sekolah',
                'nomor_npwp',
                'nomor_whatsapp',
                'penulis_tambahan',
            ]);
        });
    }
};
