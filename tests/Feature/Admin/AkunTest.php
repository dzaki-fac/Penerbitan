<?php

use App\Models\User;

test('akun index screen can be rendered', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->get(route('admin.akun.index'));

    $response->assertOk();
});

test('guests cannot access akun index', function () {
    $this->get(route('admin.akun.index'))->assertRedirect(route('login'));
});

test('admin can create a new akun', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post(route('admin.akun.store'), [
        'name' => 'Admin Baru',
        'email' => 'baru@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect();

    $user = User::where('email', 'baru@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Admin Baru')
        ->and($user->email_verified_at)->not->toBeNull();
});

test('admin can update an akun', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->patch(route('admin.akun.update', $target), [
        'name' => 'Nama Diubah',
        'email' => 'ubah@example.com',
    ]);

    $response->assertRedirect();

    expect($target->refresh()->name)->toBe('Nama Diubah')
        ->and($target->email)->toBe('ubah@example.com');
});

test('admin cannot delete their own akun', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.akun.destroy', $admin));

    $response->assertRedirect();

    expect(User::find($admin->id))->not->toBeNull();
});

test('last akun cannot be deleted', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.akun.destroy', $admin));

    $response->assertRedirect();

    expect(User::count())->toBe(1);
});

test('admin can delete another akun', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.akun.destroy', $target));

    $response->assertRedirect();

    expect(User::find($target->id))->toBeNull();
});
