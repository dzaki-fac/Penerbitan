<?php

use App\Enums\NaskahStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pemetaan nilai status lama ke status baru sesuai tahapan terbaru.
     *
     * @var array<string, string>
     */
    private const STATUS_MAP = [
        'menunggu_perbaikan_dokumen' => 'revisi_dokumen',
        'menunggu_review_editing_layout' => 'pengajuan_isbn',
        'menunggu_persetujuan_isbn' => 'isbn_terbit',
        'finalisasi' => 'proses_cetak',
        'masuk_cetak' => 'proses_cetak',
        'buku_diambil' => 'selesai',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->string('status', 50)->default(NaskahStatus::DataDiterima->value)->change();
        });
        Schema::table('workflow_histories', function (Blueprint $table) {
            $table->string('dari_status', 50)->nullable()->change();
            $table->string('ke_status', 50)->change();
        });
        Schema::table('isbns', function (Blueprint $table) {
            $table->string('status', 50)->default('proses')->change();
        });

        foreach (self::STATUS_MAP as $old => $new) {
            DB::table('naskahs')->where('status', $old)->update(['status' => $new]);
            DB::table('workflow_histories')->where('ke_status', $old)->update(['ke_status' => $new]);
            DB::table('workflow_histories')->where('dari_status', $old)->update(['dari_status' => $new]);
        }

        DB::table('isbns')->whereIn('status', ['menunggu_persetujuan', 'disetujui'])->update(['status' => 'terbit']);

        foreach (NaskahStatus::cases() as $status) {
            DB::table('naskahs')->where('status', $status->value)->update(['progress' => $status->progress()]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->enum('status', array_column(NaskahStatus::cases(), 'value'))
                ->default(NaskahStatus::DataDiterima->value)
                ->change();
        });
        Schema::table('workflow_histories', function (Blueprint $table) {
            $table->enum('dari_status', array_column(NaskahStatus::cases(), 'value'))->nullable()->change();
            $table->enum('ke_status', array_column(NaskahStatus::cases(), 'value'))->change();
        });
    }
};
