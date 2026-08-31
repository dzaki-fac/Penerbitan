<?php

use App\Models\Author;
use App\Models\Naskah;
use App\Models\User;

test('creating a naskah requires fakultas sekolah', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post(route('admin.naskah.store'), [
        'jenis_identitas' => 'nim',
        'nomor_identitas' => 'G1X2Y3Z4',
        'nama' => 'Budi Santoso',
        'judul' => 'Judul Contoh',
        'tanggal_pengajuan' => '2026-08-15 09:00:00',
        'fakultas_sekolah' => '',
    ]);

    $response->assertInvalid('fakultas_sekolah');
    expect(Naskah::where('judul', 'Judul Contoh')->exists())->toBeFalse();
});

test('creating a naskah with fakultas sekolah succeeds', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), [
            'jenis_identitas' => 'nim',
            'nomor_identitas' => 'N1M2B3U4',
            'nama' => 'Siti Nurhaliza',
            'judul' => 'Naskah Lengkap',
            'tanggal_pengajuan' => '2026-08-15 09:00:00',
            'fakultas_sekolah' => 'Fakultas Teknik',
        ])
        ->assertRedirect(route('admin.naskah.show', Naskah::where('judul', 'Naskah Lengkap')->firstOrFail()));

    expect(Author::where('nomor_identitas', 'N1M2B3U4')->value('fakultas_sekolah'))
        ->toBe('Fakultas Teknik');
});
