<?php

namespace Database\Factories;

use App\Enums\IdentitasType;
use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Author>
 */
class AuthorFactory extends Factory
{
    /**
     * Status yang tersedia di Google Form.
     *
     * @var array<int, string>
     */
    public const STATUS_OPTIONS = [
        'Dosen Universitas Diponegoro',
        'Mahasiswa Universitas Diponegoro',
    ];

    /**
     * Contoh fakultas/sekolah di Universitas Diponegoro.
     *
     * @var array<int, string>
     */
    public const FAKULTAS_OPTIONS = [
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
        'Fakultas Perikanan dan Ilmu Kelautan',
        'Sekolah Vokasi',
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(self::STATUS_OPTIONS);
        $isDosen = str_contains($status, 'Dosen');

        return [
            'nama' => fake()->name(),
            'jenis_identitas' => $isDosen ? IdentitasType::NIP : IdentitasType::NIM,
            'nomor_identitas' => $isDosen
                ? (string) fake()->unique()->numerify('###############')
                : (string) fake()->unique()->numberBetween(200000000000, 240000000099),
            'email' => fake()->unique()->safeEmail(),
            'status' => $status,
            'fakultas_sekolah' => fake()->randomElement(self::FAKULTAS_OPTIONS),
            'nomor_npwp' => fake()->numerify('##.###.###.#-###.###'),
            'nomor_whatsapp' => '08'.fake()->numerify('##########'),
            'penulis_tambahan' => fake()->optional(0.3)->name(),
        ];
    }
}
