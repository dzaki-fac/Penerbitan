<?php

use App\Enums\AktorType;
use App\Models\Naskah;
use App\Models\User;
use App\Models\WorkflowHistory;

test('admin dapat memperbarui catatan pada riwayat transisi', function () {
    $admin = User::factory()->create();
    $naskah = Naskah::factory()->create();
    $history = WorkflowHistory::factory()->create([
        'naskah_id' => $naskah->id,
        'admin_id' => $admin->id,
        'aktor' => AktorType::Admin,
    ]);

    $response = $this->actingAs($admin)->patch(
        route('admin.naskah.history.update', ['naskah' => $naskah, 'history' => $history]),
        ['catatan' => 'Link upload revisi: https://drive.google.com/file/d/x/view'],
    );

    $response->assertRedirect();

    expect($history->refresh()->catatan)->toBe('Link upload revisi: https://drive.google.com/file/d/x/view');
});

test('admin tidak dapat memperbarui catatan riwayat tanpa admin asal', function () {
    $admin = User::factory()->create();
    $naskah = Naskah::factory()->create();
    $history = WorkflowHistory::factory()->create([
        'naskah_id' => $naskah->id,
        'admin_id' => null,
        'aktor' => AktorType::Penulis,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.naskah.history.update', ['naskah' => $naskah, 'history' => $history]), ['catatan' => 'Ubah'])
        ->assertForbidden();
});

test('admin tidak dapat memperbarui catatan riwayat milik naskah lain', function () {
    $admin = User::factory()->create();
    $naskah = Naskah::factory()->create();
    $other = Naskah::factory()->create();
    $history = WorkflowHistory::factory()->create([
        'naskah_id' => $other->id,
        'admin_id' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.naskah.history.update', ['naskah' => $naskah, 'history' => $history]), ['catatan' => 'Ubah'])
        ->assertForbidden();
});

test('guest tidak dapat memperbarui catatan riwayat', function () {
    $naskah = Naskah::factory()->create();
    $history = WorkflowHistory::factory()->create([
        'naskah_id' => $naskah->id,
        'admin_id' => null,
    ]);

    $this->patch(route('admin.naskah.history.update', ['naskah' => $naskah, 'history' => $history]), ['catatan' => 'Ubah'])
        ->assertRedirect(route('login'));
});
