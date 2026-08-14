<?php

namespace App\Enums;

enum NaskahStatus: string
{
    case DataDiterima = 'data_diterima';
    case VerifikasiDokumen = 'verifikasi_dokumen';
    case RevisiDokumen = 'revisi_dokumen';
    case DalamProsesEditingLayout = 'dalam_proses_editing_layout';
    case RevisiEditingLayout = 'revisi_editing_layout';
    case PengajuanIsbn = 'pengajuan_isbn';
    case RevisiIsbn = 'revisi_isbn';
    case IsbnTerbit = 'isbn_terbit';
    case ProofReadingPenulis = 'proof_reading_penulis';
    case RevisiProofReading = 'revisi_proof_reading';
    case AccProofReading = 'acc_proof_reading';
    case ProsesCetak = 'proses_cetak';
    case SiapDiambil = 'siap_diambil';
    case Selesai = 'selesai';

    public function label(): string
    {
        return match ($this) {
            self::DataDiterima => 'Data Diterima',
            self::VerifikasiDokumen => 'Verifikasi Dokumen',
            self::RevisiDokumen => 'Revisi Dokumen',
            self::DalamProsesEditingLayout => 'Proses Editing & Layout',
            self::RevisiEditingLayout => 'Revisi Editing & Layout',
            self::PengajuanIsbn => 'Pengajuan ISBN & Verifikasi Perpusnas RI',
            self::RevisiIsbn => 'Revisi ISBN',
            self::IsbnTerbit => 'ISBN Terbit',
            self::ProofReadingPenulis => 'Proof Reading Penulis',
            self::RevisiProofReading => 'Revisi Proof Reading',
            self::AccProofReading => 'Acc Proof Reading',
            self::ProsesCetak => 'Proses Cetak',
            self::SiapDiambil => 'Siap Diambil',
            self::Selesai => 'Selesai',
        };
    }

    public function progress(): int
    {
        return match ($this) {
            self::DataDiterima => 5,
            self::VerifikasiDokumen, self::RevisiDokumen => 10,
            self::DalamProsesEditingLayout => 25,
            self::RevisiEditingLayout => 20,
            self::PengajuanIsbn => 50,
            self::RevisiIsbn => 45,
            self::IsbnTerbit => 60,
            self::ProofReadingPenulis => 70,
            self::RevisiProofReading => 65,
            self::AccProofReading => 75,
            self::ProsesCetak => 85,
            self::SiapDiambil => 95,
            self::Selesai => 100,
        };
    }

    /**
     * Indeks tahapan utama (0-7) tempat status ini berada.
     *
     * Status akhir/turunan (revisi, terbit, acc) dipetakan ke tahapan utamanya
     * agar ditampilkan sebagai badge di dalam step timeline yang sama.
     */
    public function stage(): int
    {
        return match ($this) {
            self::DataDiterima => 0,
            self::VerifikasiDokumen, self::RevisiDokumen => 1,
            self::DalamProsesEditingLayout, self::RevisiEditingLayout => 2,
            self::PengajuanIsbn, self::RevisiIsbn, self::IsbnTerbit => 3,
            self::ProofReadingPenulis, self::RevisiProofReading, self::AccProofReading => 4,
            self::ProsesCetak => 5,
            self::SiapDiambil => 6,
            self::Selesai => 7,
        };
    }

    /**
     * Daftar tahapan utama untuk progress timeline.
     *
     * @return array<int, self>
     */
    public static function ordered(): array
    {
        return [
            self::DataDiterima,
            self::VerifikasiDokumen,
            self::DalamProsesEditingLayout,
            self::PengajuanIsbn,
            self::ProofReadingPenulis,
            self::ProsesCetak,
            self::SiapDiambil,
            self::Selesai,
        ];
    }

    /**
     * Seluruh status yang tergabung dalam sebuah tahapan utama.
     *
     * @return array<int, self>
     */
    public static function forStage(int $stage): array
    {
        return array_values(array_filter(
            self::cases(),
            fn (self $status) => $status->stage() === $stage,
        ));
    }
}
