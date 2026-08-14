<?php

namespace Database\Seeders;

use App\Enums\AktorType;
use App\Enums\IdentitasType;
use App\Enums\IsbnStatus;
use App\Enums\LayoutStatus;
use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Isbn;
use App\Models\Layout;
use App\Models\Naskah;
use App\Models\User;
use App\Services\WorkflowService;
use Database\Factories\NaskahFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin Penerbitan',
            'email' => 'admin@example.com',
        ]);

        $budi = Author::create([
            'nama' => 'Budi Santoso',
            'jenis_identitas' => IdentitasType::NIM,
            'nomor_identitas' => '2112345001',
            'email' => 'budi@example.com',
            'status' => 'Mahasiswa Universitas Diponegoro',
            'fakultas_sekolah' => 'Fakultas Teknik',
            'nomor_npwp' => '12.345.678.9-012.345',
            'nomor_whatsapp' => '081234567890',
        ]);

        $siti = Author::create([
            'nama' => 'Dr. Siti Rahayu',
            'jenis_identitas' => IdentitasType::NIP,
            'nomor_identitas' => '198501012010012001',
            'email' => 'siti@example.com',
            'status' => 'Dosen Universitas Diponegoro',
            'fakultas_sekolah' => 'Fakultas Ekonomika dan Bisnis',
            'nomor_npwp' => '98.765.432.1-098.765',
            'nomor_whatsapp' => '081298765432',
            'penulis_tambahan' => 'Dr. Ahmad Fauzi',
        ]);

        $andi = Author::create([
            'nama' => 'Andi Pratama',
            'jenis_identitas' => IdentitasType::NIM,
            'nomor_identitas' => '2112345002',
            'email' => 'andi@example.com',
            'status' => 'Mahasiswa Universitas Diponegoro',
            'fakultas_sekolah' => 'Fakultas Teknik',
            'nomor_npwp' => '11.111.111.1-111.111',
            'nomor_whatsapp' => '085712345678',
        ]);

        // 1. Budi - naskah menunggu proof reading (acc/revisi oleh penulis)
        $naskah = $this->createNaskah(
            $budi,
            'Penerapan Machine Learning untuk Prediksi Hasil Panen',
            'https://drive.google.com/file/d/example-cover-1/view',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditingLayout,
            NaskahStatus::PengajuanIsbn,
            NaskahStatus::IsbnTerbit,
            NaskahStatus::ProofReadingPenulis,
        ]);
        Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => 1,
            'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-1/preview',
            'status' => LayoutStatus::Disetujui,
        ]);
        Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => 2,
            'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-1b/preview',
            'status' => LayoutStatus::MenungguReview,
        ]);
        Isbn::create([
            'naskah_id' => $naskah->id,
            'nomor_isbn' => '978-602-4523-01-7',
            'penerbit' => 'Deepublish',
            'status' => IsbnStatus::Terbit,
        ]);

        // 2. Budi - naskah baru, data diterima
        $naskah = $this->createNaskah(
            $budi,
            'Analisis Sentimen Media Sosial terhadap Program MBKM',
            'https://drive.google.com/file/d/example-cover-2/view',
        );
        $this->walk($naskah, $admin, [NaskahStatus::DataDiterima]);

        // 3. Siti - naskah pada tahap pengajuan ISBN & verifikasi Perpusnas RI
        $naskah = $this->createNaskah(
            $siti,
            'Manajemen Strategis Pendidikan Tinggi di Era Digital',
            'https://drive.google.com/file/d/example-cover-3/view',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditingLayout,
            NaskahStatus::PengajuanIsbn,
        ]);
        Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => 1,
            'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-2/preview',
            'status' => LayoutStatus::Disetujui,
        ]);
        Isbn::create([
            'naskah_id' => $naskah->id,
            'nomor_isbn' => '978-602-4523-01-7',
            'penerbit' => 'Deepublish',
            'status' => IsbnStatus::Proses,
        ]);

        // 4. Siti - naskah selesai, buku diambil
        $naskah = $this->createNaskah(
            $siti,
            'Panduan Penulisan Artikel Ilmiah untuk Mahasiswa',
            'https://drive.google.com/file/d/example-cover-4/view',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditingLayout,
            NaskahStatus::PengajuanIsbn,
            NaskahStatus::IsbnTerbit,
            NaskahStatus::ProofReadingPenulis,
            NaskahStatus::AccProofReading,
            NaskahStatus::ProsesCetak,
            NaskahStatus::SiapDiambil,
            NaskahStatus::Selesai,
        ]);
        Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => 1,
            'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-3/preview',
            'status' => LayoutStatus::Disetujui,
        ]);
        Isbn::create([
            'naskah_id' => $naskah->id,
            'nomor_isbn' => '978-602-4523-02-4',
            'penerbit' => 'Deepublish',
            'status' => IsbnStatus::Terbit,
        ]);

        // 5. Andi - naskah dalam verifikasi dokumen
        $naskah = $this->createNaskah(
            $andi,
            'Rancang Bangun Sistem IoT untuk Monitoring Kualitas Air',
            'https://drive.google.com/file/d/example-cover-5/view',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
        ]);

        // 6. Andi - naskah menunggu revisi dokumen dari penulis
        $naskah = $this->createNaskah(
            $andi,
            'Implementasi Blockchain pada Sistem Keuangan Mikro',
            'https://drive.google.com/file/d/example-cover-6/view',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::RevisiDokumen,
        ]);
    }

    /**
     * Membuat naskah baru pada status awal Data Diterima.
     */
    private function createNaskah(Author $author, string $judul, string $linkCover): Naskah
    {
        $naskah = Naskah::create([
            'author_id' => $author->id,
            'judul' => $judul,
            'link_cover' => $linkCover,
            'tanggal_pengajuan' => now()->subDays(rand(3, 40)),
            'sumber_form' => 'Form Pengajuan Naskah',
            'status' => NaskahStatus::DataDiterima,
            'progress' => NaskahStatus::DataDiterima->progress(),
            'kebijakan_akses' => NaskahFactory::KEBIJAKAN_AKSES_OPTIONS[$author->naskahs()->count() % 2],
            'biaya' => NaskahFactory::BIAYA_OPTIONS[$author->naskahs()->count() % 2],
            'nama_narahubung' => $author->nama,
            'nomor_whatsapp_narahubung' => $author->nomor_whatsapp,
            'email_narahubung' => $author->email,
            'link_dummy_upload' => NaskahFactory::DUMMY_UPLOAD_OPTIONS[$author->naskahs()->count() % 2],
            'link_dummy_pdf' => 'https://drive.google.com/file/d/example-dummy-pdf/view',
            'link_dummy_word' => 'https://drive.google.com/file/d/example-dummy-word/view',
            'link_surat_keaslian' => 'https://drive.google.com/file/d/example-surat-keaslian/view',
            'link_surat_penerbitan' => 'https://drive.google.com/file/d/example-surat-penerbitan/view',
        ]);

        WorkflowService::transition(
            $naskah,
            NaskahStatus::DataDiterima,
            AktorType::Sistem,
            note: 'Naskah diimpor dari Google Form',
        );

        return $naskah;
    }

    /**
     * Menelusuri deretan status untuk membentuk riwayat workflow.
     *
     * @param  array<int, NaskahStatus>  $chain
     */
    private function walk(Naskah $naskah, User $admin, array $chain): void
    {
        $previous = null;

        foreach ($chain as $status) {
            if ($previous !== null) {
                $olehPenulis = in_array($status, [
                    NaskahStatus::RevisiDokumen,
                    NaskahStatus::RevisiEditingLayout,
                    NaskahStatus::RevisiProofReading,
                    NaskahStatus::AccProofReading,
                    NaskahStatus::Selesai,
                ], true);

                WorkflowService::transition(
                    $naskah,
                    $status,
                    $olehPenulis ? AktorType::Penulis : AktorType::Admin,
                    admin: $olehPenulis ? null : $admin,
                    note: 'Transisi status '.$status->label(),
                );
            }

            $previous = $status;
        }
    }
}