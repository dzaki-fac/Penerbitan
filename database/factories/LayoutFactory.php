<?php

namespace Database\Factories;

use App\Enums\LayoutStatus;
use App\Models\Layout;
use App\Models\Naskah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Layout>
 */
class LayoutFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naskah_id' => Naskah::factory(),
            'versi' => 1,
            'file_layout' => 'layouts/sample.pdf',
            'preview_pdf_link' => fake()->url(),
            'status' => fake()->randomElement(LayoutStatus::cases()),
            'catatan_revisi' => null,
        ];
    }
}
