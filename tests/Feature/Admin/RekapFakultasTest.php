<?php

use App\Enums\IsbnStatus;
use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Isbn;
use App\Models\Naskah;
use App\Models\User;
use App\Models\WorkflowHistory;
use Inertia\Testing\AssertableInertia as Assert;

test('rekap fakultas screen can be rendered', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->get(route('admin.rekap-fakultas'));

    $response->assertOk();
});

test('guests cannot access rekap fakultas', function () {
    $this->get(route('admin.rekap-fakultas'))->assertRedirect(route('login'));
});

test('rekap fakultas aggregates naskah per fakultas', function () {
    $admin = User::factory()->create();

    $teknik = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);
    $hukum = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Hukum']);

    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'status' => NaskahStatus::PenulisMundur,
    ]);
    Naskah::factory()->create([
        'author_id' => $hukum->id,
        'status' => NaskahStatus::DataDiterima,
    ]);

    $terbit = Naskah::factory()->create([
        'author_id' => $teknik->id,
        'status' => NaskahStatus::Selesai,
    ]);
    Isbn::factory()->create([
        'naskah_id' => $terbit->id,
        'status' => IsbnStatus::Terbit,
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $terbit->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/rekap-fakultas')
            ->where('overall.total', 4)
            ->where('overall.diterima', 3)
            ->where('overall.ditolak', 1)
            ->where('overall.isbn_terbit', 1)
            ->has('faculties', 2)
            ->has(
                'faculties.0',
                fn (Assert $faculties) => $faculties
                    ->where('fakultas', 'Fakultas Teknik')
                    ->where('total', 3)
                    ->where('diterima', 2)
                    ->where('ditolak', 1)
                    ->where('isbn_terbit', 1),
            ),
        );
});
