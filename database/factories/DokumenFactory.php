<?php

namespace Database\Factories;

use App\Enums\DokumenStatus;
use App\Models\Dokumen;
use App\Models\Naskah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dokumen>
 */
class DokumenFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naskah_id' => Naskah::factory(),
            'nama_dokumen' => fake()->randomElement([
                'Naskah Utuh',
                'Abstrak',
                'Pernyataan Orisinalitas',
                'Foto/Scan Identitas',
            ]),
            'file_path' => null,
            'status' => fake()->randomElement(DokumenStatus::cases()),
            'catatan' => null,
        ];
    }
}
