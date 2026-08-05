<?php

namespace App\Services;

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
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
        'menunggu_perbaikan_dokumen' => [
            'to' => NaskahStatus::VerifikasiDokumen,
            'aksi' => 'upload_revisi',
            'label' => 'Upload Revisi',
        ],
        'revisi_penulis' => [
            'to' => NaskahStatus::DalamProsesEditing,
            'aksi' => 'upload_revisi',
            'label' => 'Upload Revisi',
        ],
        'menunggu_review_layout' => [
            'to' => NaskahStatus::PengajuanIsbn,
            'aksi' => 'approve',
            'label' => 'Setujui Layout',
        ],
        'menunggu_persetujuan_isbn' => [
            'to' => NaskahStatus::Finalisasi,
            'aksi' => 'approve',
            'label' => 'Setujui',
        ],
        'siap_diambil' => [
            'to' => NaskahStatus::BukuDiambil,
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
        'verifikasi_dokumen' => [NaskahStatus::DalamProsesEditing, NaskahStatus::MenungguPerbaikanDokumen],
        'dalam_proses_editing' => [NaskahStatus::MenungguReviewNaskah],
        'menunggu_review_naskah' => [NaskahStatus::DalamProsesLayout, NaskahStatus::RevisiPenulis],
        'revisi_layout' => [NaskahStatus::DalamProsesLayout],
        'pengajuan_isbn' => [NaskahStatus::MenungguPersetujuanIsbn],
        'revisi_isbn' => [NaskahStatus::PengajuanIsbn],
        'finalisasi' => [NaskahStatus::MasukCetak],
        'masuk_cetak' => [NaskahStatus::SiapDiambil],
    ];

    /**
     * Daftar seluruh status untuk progress bar publik.
     *
     * @return array<int, array{value: string, label: string, progress: int}>
     */
    public static function steps(): array
    {
        return array_map(fn (NaskahStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'progress' => $status->progress(),
        ], NaskahStatus::ordered());
    }

    /**
     * Transisi status naskah dengan pencatatan histori.
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
            $naskah->status = $to;
            $naskah->progress = $to->progress();
            $naskah->save();

            WorkflowHistory::create([
                'naskah_id' => $naskah->id,
                'dari_status' => $from?->value,
                'ke_status' => $to->value,
                'aktor' => $aktor->value,
                'admin_id' => $admin?->id,
                'catatan' => $note,
            ]);
        });
    }

    /**
     * Cek apakah penulis dapat memicu aksi pada status tertentu.
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
