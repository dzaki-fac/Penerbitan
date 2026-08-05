<?php

namespace Database\Factories;

use App\Enums\IsbnStatus;
use App\Models\Isbn;
use App\Models\Naskah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Isbn>
 */
class IsbnFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naskah_id' => Naskah::factory(),
            'nomor_isbn' => null,
            'penerbit' => 'Penerbit Contoh',
            'status' => fake()->randomElement(IsbnStatus::cases()),
            'catatan' => null,
        ];
    }
}
