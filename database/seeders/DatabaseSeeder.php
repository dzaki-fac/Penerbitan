<?php

namespace Database\Seeders;

use App\Enums\AktorType;
use App\Enums\DokumenStatus;
use App\Enums\IdentitasType;
use App\Enums\IsbnStatus;
use App\Enums\LayoutStatus;
use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Dokumen;
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

        // 1. Budi - naskah pada tahap review layout
        $naskah = $this->createNaskah(
            $budi,
            'Penerapan Machine Learning untuk Prediksi Hasil Panen',
            'Penelitian ini mengembangkan model prediksi hasil panen menggunakan algoritma machine learning.',
            'Penelitian',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditing,
            NaskahStatus::MenungguReviewNaskah,
            NaskahStatus::DalamProsesLayout,
            NaskahStatus::MenungguReviewLayout,
        ]);
        $this->dokumen($naskah, DokumenStatus::Lengkap);
        Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => 1,
            'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-1/preview',
            'status' => LayoutStatus::MenungguReview,
        ]);

        // 2. Budi - naskah baru, data diterima
        $naskah = $this->createNaskah(
            $budi,
            'Analisis Sentimen Media Sosial terhadap Program MBKM',
            'Analisis opini publik terhadap program Merdeka Belajar Kampus Merdeka melalui media sosial.',
            'Penelitian',
        );
        $this->walk($naskah, $admin, [NaskahStatus::DataDiterima]);
        $this->dokumen($naskah, DokumenStatus::Belum);

        // 3. Siti - naskah menunggu persetujuan ISBN
        $naskah = $this->createNaskah(
            $siti,
            'Manajemen Strategis Pendidikan Tinggi di Era Digital',
            'Buku referensi mengenai strategi pengelolaan perguruan tinggi menghadapi transformasi digital.',
            'Buku Referensi',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditing,
            NaskahStatus::MenungguReviewNaskah,
            NaskahStatus::DalamProsesLayout,
            NaskahStatus::MenungguReviewLayout,
            NaskahStatus::PengajuanIsbn,
            NaskahStatus::MenungguPersetujuanIsbn,
        ]);
        $this->dokumen($naskah, DokumenStatus::Lengkap);
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
            'status' => IsbnStatus::MenungguPersetujuan,
        ]);

        // 4. Siti - naskah selesai, buku diambil
        $naskah = $this->createNaskah(
            $siti,
            'Panduan Penulisan Artikel Ilmiah untuk Mahasiswa',
            'Buku pedoman praktis penulisan artikel ilmiah beserta contoh studi kasus.',
            'Buku Referensi',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditing,
            NaskahStatus::MenungguReviewNaskah,
            NaskahStatus::DalamProsesLayout,
            NaskahStatus::MenungguReviewLayout,
            NaskahStatus::PengajuanIsbn,
            NaskahStatus::MenungguPersetujuanIsbn,
            NaskahStatus::Finalisasi,
            NaskahStatus::MasukCetak,
            NaskahStatus::SiapDiambil,
            NaskahStatus::BukuDiambil,
        ]);
        $this->dokumen($naskah, DokumenStatus::Lengkap);
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
            'status' => IsbnStatus::Disetujui,
        ]);

        // 5. Andi - naskah dalam verifikasi dokumen
        $naskah = $this->createNaskah(
            $andi,
            'Rancang Bangun Sistem IoT untuk Monitoring Kualitas Air',
            'Perancangan sistem pemantauan kualitas air sungai berbasis Internet of Things.',
            'Skripsi',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
        ]);
        $this->dokumen($naskah, DokumenStatus::Lengkap);
        Dokumen::where('naskah_id', $naskah->id)->first()->update([
            'status' => DokumenStatus::PerluPerbaikan,
            'catatan' => 'Pernyataan orisinalitas belum ditandatangani di atas materai.',
        ]);

        // 6. Andi - naskah menunggu perbaikan dari penulis
        $naskah = $this->createNaskah(
            $andi,
            'Implementasi Blockchain pada Sistem Keuangan Mikro',
            'Studi penerapan teknologi blockchain untuk keamanan transaksi keuangan mikro.',
            'Skripsi',
        );
        $this->walk($naskah, $admin, [
            NaskahStatus::DataDiterima,
            NaskahStatus::VerifikasiDokumen,
            NaskahStatus::DalamProsesEditing,
            NaskahStatus::MenungguReviewNaskah,
            NaskahStatus::RevisiPenulis,
        ]);
        $this->dokumen($naskah, DokumenStatus::Lengkap);
    }

    /**
     * Membuat naskah baru pada status awal Data Diterima.
     */
    private function createNaskah(Author $author, string $judul, string $abstrak, string $kategori): Naskah
    {
        $naskah = Naskah::create([
            'author_id' => $author->id,
            'judul' => $judul,
            'abstrak' => $abstrak,
            'kategori' => $kategori,
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
                WorkflowService::transition(
                    $naskah,
                    $status,
                    $previous === NaskahStatus::MenungguReviewLayout
                        ? AktorType::Penulis
                        : AktorType::Admin,
                    admin: $previous === NaskahStatus::MenungguReviewLayout ? null : $admin,
                    note: 'Transisi status '.$status->label(),
                );
            }

            $previous = $status;
        }
    }

    /**
     * Membuat tiga dokumen standar untuk naskah.
     */
    private function dokumen(Naskah $naskah, DokumenStatus $status): void
    {
        foreach (['Naskah Utuh', 'Abstrak', 'Pernyataan Orisinalitas'] as $nama) {
            Dokumen::create([
                'naskah_id' => $naskah->id,
                'nama_dokumen' => $nama,
                'status' => $status,
            ]);
        }
    }
}
