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
            ->where('overall.aktif', 3)
            ->where('overall.mundur', 1)
            ->where('overall.isbn_terbit', 1)
            ->where('overall.isbn_terbit_aktif', 1)
            ->where('overall.isbn_terbit_mundur', 0)
            ->has('isbnStatuses', 4)
            ->where('isbnStatuses.0.count', 0)
            ->where('isbnStatuses.2.count', 1)
            ->where('isbnStatuses.3.value', 'terbit_mundur')
            ->where('isbnStatuses.3.count', 0)
            ->has('faculties', 2)
            ->has(
                'faculties.0',
                fn (Assert $faculties) => $faculties
                    ->where('fakultas', 'Fakultas Teknik')
                    ->where('total', 3)
                    ->where('aktif', 2)
                    ->where('mundur', 1)
                    ->where('sedang_proses', 0)
                    ->where('selesai', 2)
                    ->where('isbn_terbit', 1)
                    ->where('isbn_terbit_aktif', 1)
                    ->where('isbn_terbit_mundur', 0),
            ),
        );
});

test('rekap fakultas isbn status counts respect tanggal pengajuan filter', function () {
    $admin = User::factory()->create();
    $teknik = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);

    $inside = Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
    ]);
    $outside = Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-01-10 09:00:00',
    ]);

    Isbn::factory()->create([
        'naskah_id' => $inside->id,
        'status' => IsbnStatus::Terbit,
    ]);
    Isbn::factory()->create([
        'naskah_id' => $outside->id,
        'status' => IsbnStatus::Proses,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas', [
            'from' => '2026-08-15',
            'to' => '2026-08-15',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/rekap-fakultas')
            ->has('isbnStatuses', 4)
            ->where('isbnStatuses.0.count', 0)
            ->where('isbnStatuses.1.count', 0)
            ->where('isbnStatuses.2.count', 1)
            ->where('isbnStatuses.3.count', 0));
});

test('rekap fakultas counts naskah that ever had isbn published even if author withdrew', function () {
    $admin = User::factory()->create();
    $teknik = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);

    $mundur = Naskah::factory()->create([
        'author_id' => $teknik->id,
        'status' => NaskahStatus::PenulisMundur,
    ]);
    Isbn::factory()->create([
        'naskah_id' => $mundur->id,
        'status' => IsbnStatus::Terbit,
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $mundur->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $mundur->id,
        'dari_status' => NaskahStatus::IsbnTerbit,
        'ke_status' => NaskahStatus::PenulisMundur,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/rekap-fakultas')
            ->where('overall.isbn_terbit', 1)
            ->where('overall.isbn_terbit_aktif', 0)
            ->where('overall.isbn_terbit_mundur', 1)
            ->where('isbnStatuses.2.value', 'terbit')
            ->where('isbnStatuses.2.count', 1)
            ->where('isbnStatuses.3.value', 'terbit_mundur')
            ->where('isbnStatuses.3.count', 1)
            ->has(
                'faculties.0',
                fn (Assert $faculties) => $faculties
                    ->where('fakultas', 'Fakultas Teknik')
                    ->where('total', 1)
                    ->where('aktif', 0)
                    ->where('mundur', 1)
                    ->where('sedang_proses', 0)
                    ->where('selesai', 0)
                    ->where('isbn_terbit', 1)
                    ->where('isbn_terbit_aktif', 0)
                    ->where('isbn_terbit_mundur', 1),
            ));
});

test('rekap fakultas can be filtered by tanggal pengajuan range', function () {
    $admin = User::factory()->create();
    $teknik = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);

    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-01-10 09:00:00',
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
        'status' => NaskahStatus::DataDiterima,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas', [
            'from' => '2026-08-15',
            'to' => '2026-08-15',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/rekap-fakultas')
            ->where('overall.total', 1)
            ->where('filters.from', '2026-08-15')
            ->where('filters.to', '2026-08-15')
            ->has('faculties', 1));

    $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/rekap-fakultas')
            ->where('overall.total', 2)
            ->where('filters.from', null)
            ->where('filters.to', null));
});

test('rekap fakultas export downloads csv respecting tanggal filter', function () {
    $admin = User::factory()->create();
    $teknik = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Teknik']);
    $hukum = Author::factory()->create(['fakultas_sekolah' => 'Fakultas Hukum']);

    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'author_id' => $teknik->id,
        'tanggal_pengajuan' => '2026-01-10 09:00:00',
        'status' => NaskahStatus::PenulisMundur,
    ]);
    Naskah::factory()->create([
        'author_id' => $hukum->id,
        'status' => NaskahStatus::DataDiterima,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.rekap-fakultas.export', ['from' => '2026-08-15', 'to' => '2026-08-15']));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    $content = trim($response->streamedContent());
    $lines = explode("\n", $content);

    expect(count($lines))->toBe(4)
        ->and($lines[0])->toStartWith('Periode,')
        ->and($lines[1])->toContain('Fakultas/Sekolah', 'Total', 'Sedang Diproses', 'Selesai', 'Penulis Mundur', 'ISBN Terbit')
        ->and($lines[2])->toContain('Fakultas Teknik')
        ->and($lines[2])->toContain(',1,0,1,0,0,0,0')
        ->and($lines[3])->toStartWith('TOTAL,1,0,1');
});

test('guests cannot access rekap fakultas export', function () {
    $this->get(route('admin.rekap-fakultas.export'))->assertRedirect(route('login'));
});
