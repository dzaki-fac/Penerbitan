<?php

namespace Database\Factories;

use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Naskah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Naskah>
 */
class NaskahFactory extends Factory
{
    /**
     * Kebijakan akses yang tersedia di Google Form.
     *
     * @var array<int, string>
     */
    public const KEBIJAKAN_AKSES_OPTIONS = [
        'Open access (akses terbuka)',
        'Close access (akses tertutup) - Dijual',
    ];

    /**
     * Pilihan biaya di Google Form.
     *
     * @var array<int, string>
     */
    public const BIAYA_OPTIONS = [
        'Mandiri',
        'Universitas Diponegoro Tahun 2026',
    ];

    /**
     * Opsi unggah dokumen dummy di Google Form.
     *
     * @var array<int, string>
     */
    public const DUMMY_UPLOAD_OPTIONS = [
        'Unggah baru',
        'Revisi/Pembaharuan',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(NaskahStatus::cases());

        return [
            'author_id' => Author::factory(),
            'judul' => fake()->sentence(4),
            'link_cover' => fake()->url(),
            'tanggal_pengajuan' => fake()->date(),
            'sumber_form' => 'Form Pengajuan Naskah',
            'status' => $status,
            'progress' => $status->progress(),
            'catatan_admin' => null,
            'kebijakan_akses' => fake()->randomElement(self::KEBIJAKAN_AKSES_OPTIONS),
            'biaya' => fake()->randomElement(self::BIAYA_OPTIONS),
            'nama_narahubung' => fake()->name(),
            'nomor_whatsapp_narahubung' => '08'.fake()->numerify('##########'),
            'email_narahubung' => fake()->safeEmail(),
            'link_dummy_upload' => fake()->randomElement(self::DUMMY_UPLOAD_OPTIONS),
            'link_dummy_pdf' => 'https://drive.google.com/file/d/'.fake()->bothify('??????').'/view',
            'link_dummy_word' => 'https://drive.google.com/file/d/'.fake()->bothify('??????').'/view',
            'link_surat_keaslian' => 'https://drive.google.com/file/d/'.fake()->bothify('??????').'/view',
            'link_surat_penerbitan' => 'https://drive.google.com/file/d/'.fake()->bothify('??????').'/view',
        ];
    }
}
