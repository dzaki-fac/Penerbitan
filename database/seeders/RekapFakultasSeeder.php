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

/**
 * Seeder rekap fakultas: menyebarkan penulis dan naskah ke 10 fakultas
 * berbeda dengan campuran status (aktif di berbagai tahap, penulis mundur,
 * dan ISBN terbit) agar halaman /admin/rekap-fakultas menampilkan data
 * yang bervariasi.
 *
 * Jalankan dengan: php artisan db:seed --class=RekapFakultasSeeder
 */
class RekapFakultasSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * 10 fakultas tujuan (subset dari opsi fakultas Undip).
     *
     * @var array<int, string>
     */
    private const FAKULTAS = [
        'Fakultas Teknik',
        'Fakultas Ekonomika dan Bisnis',
        'Fakultas Hukum',
        'Fakultas Kedokteran',
        'Fakultas Ilmu Sosial dan Ilmu Politik',
        'Fakultas Sains dan Matematika',
        'Fakultas Peternakan dan Pertanian',
        'Fakultas Kesehatan Masyarakat',
        'Fakultas Psikologi',
        'Fakultas Ilmu Budaya',
    ];

    /**
     * Template rantai status. Rantai "mundur" ditandai dengan
     * NaskahStatus::PenulisMundur di ujungnya.
     *
     * @var array<int, array<int, NaskahStatus>>
     */
    private const CHAINS = [
        [NaskahStatus::DataDiterima],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::RevisiDokumen],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout, NaskahStatus::PengajuanIsbn],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout, NaskahStatus::PengajuanIsbn, NaskahStatus::IsbnTerbit],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout, NaskahStatus::PengajuanIsbn, NaskahStatus::IsbnTerbit, NaskahStatus::ProofReadingPenulis],
        [
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
        ],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::PenulisMundur],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout, NaskahStatus::PenulisMundur],
        [NaskahStatus::DataDiterima, NaskahStatus::VerifikasiDokumen, NaskahStatus::DalamProsesEditingLayout, NaskahStatus::PengajuanIsbn, NaskahStatus::IsbnTerbit, NaskahStatus::PenulisMundur],
    ];

    private int $isbnSequence = 1;

    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first()
            ?? User::factory()->create([
                'nama_lengkap' => 'Admin Penerbitan',
                'nickname' => 'Admin',
                'email' => 'admin@example.com',
            ]);

        foreach (self::FAKULTAS as $index => $fakultas) {
            // 4-7 naskah per fakultas agar rekap terlihat bervariasi.
            $count = 4 + ($index % 4);

            for ($j = 0; $j < $count; $j++) {
                $chain = self::CHAINS[($index * 3 + $j) % count(self::CHAINS)];

                $author = Author::factory()->create([
                    'fakultas_sekolah' => $fakultas,
                    'jenis_identitas' => $j % 3 === 0 ? IdentitasType::NIP : IdentitasType::NIM,
                    'status' => $j % 3 === 0
                        ? 'Dosen Universitas Diponegoro'
                        : 'Mahasiswa Universitas Diponegoro',
                ]);

                $naskah = $this->createNaskah($author);
                $this->walk($naskah, $admin, $chain);

                if (in_array(NaskahStatus::IsbnTerbit, $chain, true)) {
                    Layout::create([
                        'naskah_id' => $naskah->id,
                        'versi' => 1,
                        'preview_pdf_link' => 'https://drive.google.com/file/d/example-layout-rekap-'.$naskah->id.'/preview',
                        'status' => LayoutStatus::Disetujui,
                    ]);
                    Isbn::create([
                        'naskah_id' => $naskah->id,
                        'nomor_isbn' => sprintf('978-602-4523-%02d-%d', $this->isbnSequence, $this->isbnSequence % 10),
                        'penerbit' => 'Deepublish',
                        'status' => IsbnStatus::Terbit,
                    ]);
                    $this->isbnSequence++;
                }
            }
        }
    }

    /**
     * Membuat naskah baru pada status awal Data Diterima dengan tanggal
     * pengajuan tersebar dalam 180 hari terakhir (untuk uji filter tanggal).
     */
    private function createNaskah(Author $author): Naskah
    {
        $naskah = Naskah::create([
            'author_id' => $author->id,
            'judul' => ucfirst(fake()->sentence(4)),
            'link_cover' => 'https://leksikabookstore.com/uploads/63c1189894224_20230113153848-1.jpg',
            'tanggal_pengajuan' => now()->subDays(fake()->numberBetween(1, 180)),
            'sumber_form' => 'Form Pengajuan Naskah',
            'status' => NaskahStatus::DataDiterima,
            'progress' => NaskahStatus::DataDiterima->progress(),
            'kebijakan_akses' => fake()->randomElement(NaskahFactory::KEBIJAKAN_AKSES_OPTIONS),
            'biaya' => fake()->randomElement(NaskahFactory::BIAYA_OPTIONS),
            'nama_narahubung' => $author->nama,
            'nomor_whatsapp_narahubung' => $author->nomor_whatsapp,
            'email_narahubung' => $author->email,
            'link_dummy_upload' => fake()->randomElement(NaskahFactory::DUMMY_UPLOAD_OPTIONS),
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
                WorkflowService::transition(
                    $naskah,
                    $status,
                    AktorType::Admin,
                    admin: $admin,
                    note: 'Transisi status '.$status->label(),
                );
            }

            $previous = $status;
        }
    }
}
