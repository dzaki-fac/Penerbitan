<?php

namespace App\Enums;

enum NaskahStatus: string
{
    case DataDiterima = 'data_diterima';
    case VerifikasiDokumen = 'verifikasi_dokumen';
    case MenungguPerbaikanDokumen = 'menunggu_perbaikan_dokumen';
    case DalamProsesEditing = 'dalam_proses_editing';
    case MenungguReviewNaskah = 'menunggu_review_naskah';
    case RevisiPenulis = 'revisi_penulis';
    case DalamProsesLayout = 'dalam_proses_layout';
    case MenungguReviewLayout = 'menunggu_review_layout';
    case RevisiLayout = 'revisi_layout';
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
            self::DalamProsesEditing => 'Dalam Proses Editing',
            self::MenungguReviewNaskah => 'Menunggu Review Naskah',
            self::RevisiPenulis => 'Revisi Penulis',
            self::DalamProsesLayout => 'Dalam Proses Layout',
            self::MenungguReviewLayout => 'Menunggu Review Layout',
            self::RevisiLayout => 'Revisi Layout',
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
            self::DalamProsesEditing => 25,
            self::MenungguReviewNaskah => 30,
            self::RevisiPenulis => 25,
            self::DalamProsesLayout => 45,
            self::MenungguReviewLayout => 55,
            self::RevisiLayout => 50,
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
            self::DalamProsesEditing,
            self::MenungguReviewNaskah,
            self::RevisiPenulis,
            self::DalamProsesLayout,
            self::MenungguReviewLayout,
            self::RevisiLayout,
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
