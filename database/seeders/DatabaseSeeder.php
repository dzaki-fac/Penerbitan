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
        ]);

        $siti = Author::create([
            'nama' => 'Dr. Siti Rahayu',
            'jenis_identitas' => IdentitasType::NIP,
            'nomor_identitas' => '198501012010012001',
            'email' => 'siti@example.com',
        ]);

        $andi = Author::create([
            'nama' => 'Andi Pratama',
            'jenis_identitas' => IdentitasType::NIM,
            'nomor_identitas' => '2112345002',
            'email' => 'andi@example.com',
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
            'sumber_form' => 'Google Form Pendaftaran',
            'status' => NaskahStatus::DataDiterima,
            'progress' => NaskahStatus::DataDiterima->progress(),
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