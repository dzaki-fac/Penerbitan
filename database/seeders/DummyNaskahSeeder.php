<?php

namespace Database\Seeders;

use App\Enums\NaskahStatus;
use App\Models\Naskah;
use Database\Factories\NaskahFactory;
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
        $statuses = NaskahStatus::cases();

        Naskah::factory()
            ->count($count)
            ->sequence(fn ($sequence) => [
                'judul' => 'Naskah Dummy #'.($sequence->index + 1).' — '.fake()->sentence(4),
                'tanggal_pengajuan' => now()->subDays($sequence->index),
                'status' => $statuses[$sequence->index % count($statuses)],
                'kebijakan_akses' => NaskahFactory::KEBIJAKAN_AKSES_OPTIONS[$sequence->index % 2],
                'biaya' => NaskahFactory::BIAYA_OPTIONS[$sequence->index % 2],
                'link_dummy_upload' => NaskahFactory::DUMMY_UPLOAD_OPTIONS[$sequence->index % 2],
            ])
            ->create()
            ->each(function (Naskah $naskah) {
                $naskah->progress = $naskah->status->progress();
                $naskah->save();
            });
    }
}
