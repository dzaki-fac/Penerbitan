<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Kolom timestamp yang menyimpan momen waktu nyata (created_at, updated_at,
 * dll.) sebelumnya ditulis sebagai UTC karena timezone app 'UTC'. Setelah
 * timezone app diganti ke Asia/Jakarta (UTC+7), data lama digeser +7 jam agar
 * interpretasinya benar. Kolom seperti tanggal_pengajuan yang berasal dari
 * input tanggal (naif) TIDAK ikut digeser.
 */
return new class extends Migration
{
    /**
     * @var array<string, list<string>>
     */
    private const COLUMNS = [
        'users' => ['created_at', 'updated_at', 'email_verified_at'],
        'password_reset_tokens' => ['created_at'],
        'authors' => ['created_at', 'updated_at'],
        'naskahs' => ['created_at', 'updated_at'],
        'workflow_histories' => ['created_at', 'updated_at'],
        'layouts' => ['created_at', 'updated_at'],
        'isbns' => ['created_at', 'updated_at'],
        'revisi_uploads' => ['created_at', 'updated_at'],
    ];

    public function up(): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            foreach ($columns as $column) {
                DB::table($table)->update([
                    $column => DB::raw("datetime({$column}, '+7 hours')"),
                ]);
            }
        }
    }

    public function down(): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            foreach ($columns as $column) {
                DB::table($table)->update([
                    $column => DB::raw("datetime({$column}, '-7 hours')"),
                ]);
            }
        }
    }
};
