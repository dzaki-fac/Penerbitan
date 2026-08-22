<?php

use App\Enums\NaskahStatus;
use App\Models\Naskah;
use App\Models\User;
use App\Models\WorkflowHistory;

test('dashboard screen can be rendered', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->where('filters.from', null)
            ->where('filters.to', null));
});

test('guests cannot access dashboard', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('dashboard stats respect tanggal pengajuan filter', function () {
    $admin = User::factory()->create();

    Naskah::factory()->create([
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'tanggal_pengajuan' => '2026-01-10 09:00:00',
        'status' => NaskahStatus::DataDiterima,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['from' => '2026-08-15', 'to' => '2026-08-15']))
        ->assertInertia(fn ($page) => $page
            ->where('stats.total', 1)
            ->where('stats.terbit', 0)
            ->where('stats.sedang_proses', 1)
            ->where('stats.penulis_mundur', 0)
            ->where('filters.from', '2026-08-15')
            ->where('filters.to', '2026-08-15'));
});

test('dashboard stats count terbit from workflow history including mundur after terbit', function () {
    $admin = User::factory()->create();

    $terbit = Naskah::factory()->create(['status' => NaskahStatus::Selesai]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $terbit->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);

    $mundurSetelahTerbit = Naskah::factory()->create(['status' => NaskahStatus::PenulisMundur]);
    WorkflowHistory::factory()->create([
        'naskah_id' => $mundurSetelahTerbit->id,
        'dari_status' => NaskahStatus::PengajuanIsbn,
        'ke_status' => NaskahStatus::IsbnTerbit,
    ]);

    $mentah = Naskah::factory()->create(['status' => NaskahStatus::DataDiterima]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('stats.total', 3)
            ->where('stats.terbit', 2)
            ->where('stats.sedang_proses', 1)
            ->where('stats.penulis_mundur', 0));
});

test('dashboard export downloads csv respecting tanggal filter', function () {
    $admin = User::factory()->create();

    Naskah::factory()->create([
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
        'status' => NaskahStatus::Selesai,
    ]);
    Naskah::factory()->create([
        'tanggal_pengajuan' => '2026-01-10 09:00:00',
        'status' => NaskahStatus::DataDiterima,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.dashboard.export', ['from' => '2026-08-15', 'to' => '2026-08-15']));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    $content = trim($response->streamedContent());

    expect($content)->toStartWith('Periode,')
        ->and($content)->toContain('Kategori,Status,Jumlah')
        ->and($content)->toContain('Naskah,TOTAL,1');
});

test('guests cannot access dashboard export', function () {
    $this->get(route('admin.dashboard.export'))->assertRedirect(route('login'));
});
