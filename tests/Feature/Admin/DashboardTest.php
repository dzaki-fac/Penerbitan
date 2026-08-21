<?php

use App\Enums\NaskahStatus;
use App\Models\Naskah;
use App\Models\User;

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
            ->where('stats.selesai', 1)
            ->where('filters.from', '2026-08-15')
            ->where('filters.to', '2026-08-15'));
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
