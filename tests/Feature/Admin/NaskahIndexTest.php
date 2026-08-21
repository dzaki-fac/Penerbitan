<?php

use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Naskah;
use App\Models\User;
use App\Models\WorkflowHistory;
use Inertia\Testing\AssertableInertia as Assert;

test('filtering naskah by status isbn_terbit shows naskah that ever had isbn published', function () {
    $admin = User::factory()->create();
    $author = Author::factory()->create();

    $terbit = Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::Selesai,
        'created_at' => now()->subMinutes(5),
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $terbit->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);

    $mundurSetelahTerbit = Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::PenulisMundur,
        'created_at' => now()->subMinutes(4),
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $mundurSetelahTerbit->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $mundurSetelahTerbit->id,
        'dari_status' => NaskahStatus::IsbnTerbit,
        'ke_status' => NaskahStatus::PenulisMundur,
    ]);

    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::DataDiterima,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', ['status' => 'isbn_terbit']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/naskah/index')
            ->where('naskahs.total', 2)
            ->where('naskahs.data.0.status.value', 'penulis_mundur')
            ->where('naskahs.data.1.status.value', 'selesai'));
});

test('deleting a naskah preserves the active filters on redirect', function () {
    $admin = User::factory()->create();
    $author = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);

    $naskah = Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::DataDiterima,
    ]);
    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::DataDiterima,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.naskah.destroy', $naskah), [
            'fakultas' => 'Fakultas Teknik',
            'status' => 'data_diterima',
            'search' => '',
            'stage' => '',
            'per_page' => '10',
        ])
        ->assertRedirect('/admin/naskah?'.http_build_query([
            'fakultas' => 'Fakultas Teknik',
            'per_page' => '10',
            'status' => 'data_diterima',
        ], '', '&', PHP_QUERY_RFC3986));
});

test('filtering naskah by a regular status matches the current status exactly', function () {
    $admin = User::factory()->create();
    $author = Author::factory()->create();

    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::PenulisMundur,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', ['status' => 'penulis_mundur']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/naskah/index')
            ->where('naskahs.total', 1)
            ->where('naskahs.data.0.status.value', 'penulis_mundur'));
});

test('sorting naskah by penulis works without error', function () {
    $admin = User::factory()->create();
    $andi = Author::factory()->create(['nama' => 'Andi Pratama']);
    $budi = Author::factory()->create(['nama' => 'Budi Santoso']);
    $siti = Author::factory()->create(['nama' => 'Siti Rahayu']);

    Naskah::factory()->create(['author_id' => $siti->id]);
    Naskah::factory()->create(['author_id' => $andi->id]);
    Naskah::factory()->create(['author_id' => $budi->id]);

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', [
            'sort_by' => 'penulis',
            'sort_dir' => 'asc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/naskah/index')
            ->where('naskahs.data.0.penulis', 'Andi Pratama')
            ->where('naskahs.data.1.penulis', 'Budi Santoso')
            ->where('naskahs.data.2.penulis', 'Siti Rahayu'));

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', [
            'sort_by' => 'penulis',
            'sort_dir' => 'desc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('naskahs.data.0.penulis', 'Siti Rahayu'));
});

test('sorting naskah by status orders by workflow progress not alphabetically', function () {
    $admin = User::factory()->create();
    $author = Author::factory()->create();

    // Abjad: "selesai" < "verifikasi_dokumen", tapi progress Selesai = 100
    // sedangkan VerifikasiDokumen = 10, jadi urutan harus berdasarkan progres.
    // Progress diset eksplisit karena factory mengisi progress acak.
    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::VerifikasiDokumen,
        'progress' => NaskahStatus::VerifikasiDokumen->progress(),
    ]);
    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::Selesai,
        'progress' => NaskahStatus::Selesai->progress(),
    ]);
    Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::DataDiterima,
        'progress' => NaskahStatus::DataDiterima->progress(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', [
            'sort_by' => 'status',
            'sort_dir' => 'asc',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('naskahs.data.0.status.value', 'data_diterima')
            ->where('naskahs.data.1.status.value', 'verifikasi_dokumen')
            ->where('naskahs.data.2.status.value', 'selesai'));

    $this->actingAs($admin)
        ->get(route('admin.naskah.index', [
            'sort_by' => 'status',
            'sort_dir' => 'desc',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('naskahs.data.0.status.value', 'selesai'));
});
