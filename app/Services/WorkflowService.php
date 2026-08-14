<?php

namespace App\Services;

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
use App\Exceptions\WorkflowConflictException;
use App\Models\Naskah;
use App\Models\User;
use App\Models\WorkflowHistory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class WorkflowService
{
    /**
     * Status yang dapat dipicu langsung oleh penulis tanpa login.
     *
     * @var array<string, array{to: NaskahStatus, aksi: string, label: string}>
     */
    public const AUTHOR_ACTIONS = [
        'revisi_dokumen' => [
            'to' => NaskahStatus::VerifikasiDokumen,
            'aksi' => 'upload_revisi',
            'label' => 'Upload Revisi Dokumen',
        ],
        'revisi_editing_layout' => [
            'to' => NaskahStatus::DalamProsesEditingLayout,
            'aksi' => 'upload_revisi',
            'label' => 'Upload Revisi',
        ],
        'proof_reading_penulis' => [
            'to' => NaskahStatus::AccProofReading,
            'aksi' => 'review',
            'label' => 'Acc / Ajukan Revisi',
        ],
        'siap_diambil' => [
            'to' => NaskahStatus::Selesai,
            'aksi' => 'approve',
            'label' => 'Buku Sudah Diambil',
        ],
    ];

    /**
     * Status yang hanya dapat dipicu oleh admin.
     *
     * @var array<string, array<int, NaskahStatus>>
     */
    public const ADMIN_TRANSITIONS = [
        'data_diterima' => [NaskahStatus::VerifikasiDokumen],
        'verifikasi_dokumen' => [NaskahStatus::DalamProsesEditingLayout, NaskahStatus::RevisiDokumen],
        'revisi_dokumen' => [],
        'dalam_proses_editing_layout' => [NaskahStatus::PengajuanIsbn, NaskahStatus::RevisiEditingLayout],
        'revisi_editing_layout' => [],
        'pengajuan_isbn' => [NaskahStatus::IsbnTerbit, NaskahStatus::RevisiIsbn],
        'revisi_isbn' => [NaskahStatus::PengajuanIsbn, NaskahStatus::IsbnTerbit],
        'isbn_terbit' => [NaskahStatus::ProofReadingPenulis],
        'proof_reading_penulis' => [],
        'revisi_proof_reading' => [NaskahStatus::ProofReadingPenulis],
        'acc_proof_reading' => [NaskahStatus::ProsesCetak],
        'proses_cetak' => [NaskahStatus::SiapDiambil],
        'siap_diambil' => [],
    ];

    /**
     * Daftar seluruh tahapan utama untuk progress bar publik.
     *
     * @return array<int, array{value: string, label: string, progress: int, stage: int}>
     */
    public static function steps(): array
    {
        return array_map(fn (NaskahStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'progress' => $status->progress(),
            'stage' => $status->stage(),
        ], NaskahStatus::ordered());
    }

    /**
     * Transisi status naskah dengan pencatatan histori.
     *
     * Baris naskah dikunci (lockForUpdate) dan statusnya dicek ulang di dalam
     * transaksi agar dua admin yang submit bersamaan tidak saling menimpa
     * atau menghasilkan status ganda yang tidak konsisten.
     *
     * @throws WorkflowConflictException
     * @throws ModelNotFoundException
     */
    public static function transition(
        Naskah $naskah,
        NaskahStatus $to,
        AktorType $aktor,
        ?User $admin = null,
        ?string $note = null,
    ): void {
        $from = $naskah->status;

        DB::transaction(function () use ($naskah, $from, $to, $aktor, $admin, $note) {
            self::assertFreshStatus($naskah, $from);

            $naskah->status = $to;
            $naskah->progress = $to->progress();
            $naskah->save();

            WorkflowHistory::create([
                'naskah_id' => $naskah->id,
                'dari_status' => $from->value,
                'ke_status' => $to->value,
                'aktor' => $aktor->value,
                'admin_id' => $admin?->id,
                'catatan' => $note,
            ]);
        });
    }

    /**
     * Kunci baris naskah (harus dipanggil di dalam transaksi aktif) dan pastikan
     * status di database masih sama dengan yang diharapkan. Melindungi aksi
     * multi-tulis (upload revisi, layout, ISBN, dll.) dari race condition.
     *
     * @throws WorkflowConflictException
     * @throws ModelNotFoundException
     */
    public static function assertFreshStatus(Naskah $naskah, NaskahStatus $expected): void
    {
        $fresh = Naskah::query()
            ->whereKey($naskah->getKey())
            ->lockForUpdate()
            ->firstOrFail();

        if ($fresh->status !== $expected) {
            throw new WorkflowConflictException;
        }
    }

    /**
     * Cek apakah penulis dapat memicu aksi pada status tertentu.
     *
     * @return array{to: NaskahStatus, aksi: string, label: string}|null
     */
    public static function authorActionFor(string $status): ?array
    {
        return self::AUTHOR_ACTIONS[$status] ?? null;
    }

    /**
     * Cek apakah admin dapat memicu transisi pada status tertentu.
     *
     * @return array<int, NaskahStatus>
     */
    public static function adminTransitionsFor(string $status): array
    {
        return self::ADMIN_TRANSITIONS[$status] ?? [];
    }

    /**
     * Verifikasi identitas penulis untuk aksi publik tanpa login.
     */
    public static function verifyAuthor(Naskah $naskah, string $jenisIdentitas, string $nomorIdentitas): bool
    {
        $author = $naskah->author;

        return $author->jenis_identitas->value === $jenisIdentitas
            && $author->nomor_identitas === $nomorIdentitas;
    }

    /**
     * Validasi bahwa status saat ini memungkinkan aksi penulis (approve/reject).
     *
     * @throws ModelNotFoundException
     */
    public static function assertAuthorCanAct(Naskah $naskah, string $aksi): void
    {
        $allowed = self::authorActionFor($naskah->status->value);

        if (! $allowed || $allowed['aksi'] !== $aksi) {
            throw new ModelNotFoundException('Aksi tidak diizinkan pada status saat ini.');
        }
    }
}
