<?php

namespace Database\Seeders;

use App\Enums\NaskahStatus;
use App\Models\Naskah;
use Illuminate\Database\Seeder;

class DummyNaskahSeeder extends Seeder
{
    /**
     * Menambahkan naskah dummy untuk menguji pagination.
     *
     * @param  int  $count  jumlah naskah dummy yang ditambahkan
     */
    public function run(int $count = 35): void
    {
        Naskah::factory()
            ->count($count)
            ->sequence(fn ($sequence) => [
                'judul' => 'Naskah Dummy #'.($sequence->index + 1).' — '.fake()->sentence(4),
                'tanggal_pengajuan' => now()->subDays($sequence->index),
                'status' => fake()->randomElement(NaskahStatus::cases()),
            ])
            ->create()
            ->each(function (Naskah $naskah) {
                $naskah->progress = $naskah->status->progress();
                $naskah->save();
            });
    }
}
