<?php

namespace App\Enums;

enum NaskahStatus: string
{
    case DataDiterima = 'data_diterima';
    case VerifikasiDokumen = 'verifikasi_dokumen';
    case MenungguPerbaikanDokumen = 'menunggu_perbaikan_dokumen';
    case DalamProsesEditingLayout = 'dalam_proses_editing_layout';
    case MenungguReviewEditingLayout = 'menunggu_review_editing_layout';
    case RevisiEditingLayout = 'revisi_editing_layout';
    case PengajuanIsbn = 'pengajuan_isbn';
    case MenungguPersetujuanIsbn = 'menunggu_persetujuan_isbn';
    case RevisiIsbn = 'revisi_isbn';
    case Finalisasi = 'finalisasi';
    case MasukCetak = 'masuk_cetak';
    case SiapDiambil = 'siap_diambil';
    case BukuDiambil = 'buku_diambil';

    public function label(): string
    {
        return match ($this) {
            self::DataDiterima => 'Data Diterima',
            self::VerifikasiDokumen => 'Verifikasi Dokumen',
            self::MenungguPerbaikanDokumen => 'Menunggu Perbaikan Dokumen',
            self::DalamProsesEditingLayout => 'Dalam Proses Editing & Layout',
            self::MenungguReviewEditingLayout => 'Menunggu Review Naskah & Layout',
            self::RevisiEditingLayout => 'Revisi Naskah & Layout',
            self::PengajuanIsbn => 'Pengajuan ISBN',
            self::MenungguPersetujuanIsbn => 'Menunggu Persetujuan ISBN',
            self::RevisiIsbn => 'Revisi ISBN',
            self::Finalisasi => 'Finalisasi',
            self::MasukCetak => 'Masuk Cetak',
            self::SiapDiambil => 'Siap Diambil',
            self::BukuDiambil => 'Buku Diambil',
        };
    }

    public function progress(): int
    {
        return match ($this) {
            self::DataDiterima => 5,
            self::VerifikasiDokumen => 10,
            self::MenungguPerbaikanDokumen => 10,
            self::DalamProsesEditingLayout => 25,
            self::MenungguReviewEditingLayout => 50,
            self::RevisiEditingLayout => 40,
            self::PengajuanIsbn => 65,
            self::MenungguPersetujuanIsbn => 75,
            self::RevisiIsbn => 70,
            self::Finalisasi => 85,
            self::MasukCetak => 90,
            self::SiapDiambil => 95,
            self::BukuDiambil => 100,
        };
    }

    /**
     * @return array<int, self>
     */
    public static function ordered(): array
    {
        return [
            self::DataDiterima,
            self::VerifikasiDokumen,
            self::MenungguPerbaikanDokumen,
            self::DalamProsesEditingLayout,
            self::MenungguReviewEditingLayout,
            self::RevisiEditingLayout,
            self::PengajuanIsbn,
            self::MenungguPersetujuanIsbn,
            self::RevisiIsbn,
            self::Finalisasi,
            self::MasukCetak,
            self::SiapDiambil,
            self::BukuDiambil,
        ];
    }
}
