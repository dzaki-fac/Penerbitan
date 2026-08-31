<?php

use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Naskah;
use App\Models\User;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function coverUploadJpg(): File
{
    // JPEG 1x1 valid (tanpa dependensi ekstensi GD).
    return UploadedFile::fake()->createWithContent('cover.jpg', base64_decode(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q=='
    ));
}

function coverUploadPng(): File
{
    // PNG 1x1 valid.
    return UploadedFile::fake()->createWithContent('cover.png', base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    ));
}

function coverUploadWebp(): File
{
    // WEBP 1x1 valid.
    return UploadedFile::fake()->createWithContent('cover.webp', base64_decode(
        'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
    ));
}

function coverUploadOversizedJpg(): File
{
    // JPEG valid yang di-padding melewati 2048 KB agar gagal di rule max,
    // bukan di rule image/mimes.
    $jpg = base64_decode(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q=='
    );

    return UploadedFile::fake()->createWithContent('besar.jpg', $jpg.str_repeat("\0", 2100 * 1024));
}

function coverUploadStorePayload(): array
{
    return [
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2110012345',
        'nama' => 'Penulis Uji',
        'judul' => 'Judul Naskah Uji',
        'tanggal_pengajuan' => now()->format('Y-m-d H:i:s'),
    ];
}

function coverUploadUpdatePayload(Naskah $naskah): array
{
    return [
        'nama' => $naskah->author->nama,
        'judul' => $naskah->judul,
        'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('Y-m-d H:i:s'),
    ];
}

function coverUploadNaskah(): Naskah
{
    $author = Author::factory()->create();

    return Naskah::factory()->create([
        'author_id' => $author->id,
        'status' => NaskahStatus::DataDiterima,
        'progress' => NaskahStatus::DataDiterima->progress(),
    ]);
}

test('store menyimpan cover jpg maksimal 2 mb ke disk public', function () {
    Storage::fake('public');
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), array_merge(coverUploadStorePayload(), [
            'link_cover' => coverUploadJpg(),
        ]))
        ->assertRedirect();

    $naskah = Naskah::query()->latest('id')->first();
    expect($naskah->link_cover)->toStartWith('covers/')->toEndWith('.jpg');
    Storage::disk('public')->assertExists($naskah->link_cover);
});

test('store menyimpan cover png maksimal 2 mb ke disk public', function () {
    Storage::fake('public');
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), array_merge(coverUploadStorePayload(), [
            'link_cover' => coverUploadPng(),
        ]))
        ->assertRedirect();

    $naskah = Naskah::query()->latest('id')->first();
    expect($naskah->link_cover)->toStartWith('covers/')->toEndWith('.png');
    Storage::disk('public')->assertExists($naskah->link_cover);
});

test('store menyimpan cover webp maksimal 2 mb ke disk public', function () {
    Storage::fake('public');
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), array_merge(coverUploadStorePayload(), [
            'link_cover' => coverUploadWebp(),
        ]))
        ->assertRedirect();

    $naskah = Naskah::query()->latest('id')->first();
    expect($naskah->link_cover)->toStartWith('covers/')->toEndWith('.webp');
    Storage::disk('public')->assertExists($naskah->link_cover);
});

test('store menolak cover jpg lebih dari 2 mb', function () {
    Storage::fake('public');
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), array_merge(coverUploadStorePayload(), [
            'link_cover' => coverUploadOversizedJpg(),
        ]))
        ->assertSessionHasErrors(['link_cover' => 'Cover maksimal berukuran 2 MB.']);

    expect(Storage::disk('public')->allFiles('covers'))->toBeEmpty();
});

test('store menolak cover berupa pdf', function () {
    Storage::fake('public');
    $admin = User::factory()->create();

    $pdf = UploadedFile::fake()->create('cover.pdf', 100, 'application/pdf');

    $this->actingAs($admin)
        ->post(route('admin.naskah.store'), array_merge(coverUploadStorePayload(), [
            'link_cover' => $pdf,
        ]))
        ->assertSessionHasErrors('link_cover');

    expect(Storage::disk('public')->allFiles('covers'))->toBeEmpty();
});

test('update tanpa memilih cover baru tetap memakai cover lama', function () {
    Storage::fake('public');
    $admin = User::factory()->create();
    $naskah = coverUploadNaskah();

    Storage::disk('public')->put('covers/lama.png', 'isi-cover-lama');
    $naskah->forceFill(['link_cover' => 'covers/lama.png'])->save();

    $this->actingAs($admin)
        ->put(route('admin.naskah.update', $naskah), coverUploadUpdatePayload($naskah))
        ->assertRedirect();

    expect($naskah->fresh()->link_cover)->toBe('covers/lama.png');
    Storage::disk('public')->assertExists('covers/lama.png');
});

test('update dengan cover baru mengganti path cover lama', function () {
    Storage::fake('public');
    $admin = User::factory()->create();
    $naskah = coverUploadNaskah();

    Storage::disk('public')->put('covers/lama.png', 'isi-cover-lama');
    $naskah->forceFill(['link_cover' => 'covers/lama.png'])->save();

    $this->actingAs($admin)
        ->put(route('admin.naskah.update', $naskah), array_merge(coverUploadUpdatePayload($naskah), [
            'link_cover' => coverUploadJpg(),
        ]))
        ->assertRedirect();

    $fresh = $naskah->fresh();
    expect($fresh->link_cover)->toStartWith('covers/')->toEndWith('.jpg')
        ->and($fresh->link_cover)->not->toBe('covers/lama.png');
    Storage::disk('public')->assertExists($fresh->link_cover);
});

test('cover lama berupa url eksternal tetap ditampilkan apa adanya', function () {
    $admin = User::factory()->create();
    $url = 'https://drive.google.com/file/d/abc123/view';
    $naskah = coverUploadNaskah();
    $naskah->forceFill(['link_cover' => $url])->save();

    expect($naskah->link_cover_url)->toBe($url);

    $this->actingAs($admin)
        ->get(route('admin.naskah.show', $naskah))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/naskah/show')
            ->where('naskah.link_cover', $url));
});

test('cover hasil upload ditampilkan melalui url storage pada admin dan tracking', function () {
    Storage::fake('public');
    $admin = User::factory()->create();
    $naskah = coverUploadNaskah();

    Storage::disk('public')->put('covers/baru.jpg', 'isi-cover-baru');
    $naskah->forceFill(['link_cover' => 'covers/baru.jpg'])->save();

    $expectedUrl = Storage::disk('public')->url('covers/baru.jpg');

    $this->actingAs($admin)
        ->get(route('admin.naskah.show', $naskah))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/naskah/show')
            ->where('naskah.link_cover', $expectedUrl));

    $this->get(route('tracking.detail', $naskah))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tracking/detail')
            ->where('naskah.link_cover', $expectedUrl));
});
