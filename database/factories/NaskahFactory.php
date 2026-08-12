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
            'sumber_form' => null,
            'status' => $status,
            'progress' => $status->progress(),
            'catatan_admin' => null,
        ];
    }
}
