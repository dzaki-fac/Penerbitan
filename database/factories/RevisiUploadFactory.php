<?php

namespace Database\Factories;

use App\Enums\RevisiJenis;
use App\Models\Author;
use App\Models\Naskah;
use App\Models\RevisiUpload;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RevisiUpload>
 */
class RevisiUploadFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naskah_id' => Naskah::factory(),
            'author_id' => Author::factory(),
            'jenis' => fake()->randomElement(RevisiJenis::cases()),
            'file_path' => 'revisi/sample.pdf',
            'catatan_penulis' => fake()->sentence(),
        ];
    }
}
