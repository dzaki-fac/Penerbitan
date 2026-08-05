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
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => fake()->name(),
            'jenis_identitas' => fake()->randomElement(IdentitasType::cases()),
            'nomor_identitas' => (string) fake()->unique()->numberBetween(1000000000, 9999999999),
            'email' => fake()->unique()->safeEmail(),
        ];
    }
}
