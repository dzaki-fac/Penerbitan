<?php

use App\Enums\AktorType;
use App\Models\Author;
use App\Models\Naskah;
use App\Models\WorkflowHistory;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    config(['app.form_submission_token' => 'test-token-123']);
});

function webhookPost(array $payload = []): TestResponse
{
    return test()->postJson(route('api.form-submissions.store'), $payload, [
        'Authorization' => 'Bearer test-token-123',
    ]);
}

test('webhook menolak akses tanpa token yang valid', function () {
    $this->postJson(route('api.form-submissions.store'), [], [
        'Authorization' => 'Bearer salah',
    ])->assertForbidden();

    $this->postJson(route('api.form-submissions.store'))->assertForbidden();
});

test('webhook membuat penulis dan naskah baru', function () {
    $response = webhookPost([
        'form' => 'Form Pengajuan Naskah',
        'judul' => 'Buku Contoh',
        'nama' => 'Penulis Satu',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010001',
        'email' => 'penulis@example.com',
        'link_cover' => 'https://drive.google.com/file/d/cover1/view',
    ]);

    $response->assertCreated()->assertJson(['status' => 'created']);

    $author = Author::where('nomor_identitas', '2025010001')->first();

    expect($author)->not->toBeNull()
        ->and($author->nama)->toBe('Penulis Satu')
        ->and($author->email)->toBe('penulis@example.com');

    $naskah = Naskah::where('author_id', $author->id)->first();

    expect($naskah)->not->toBeNull()
        ->and($naskah->judul)->toBe('Buku Contoh')
        ->and($naskah->link_cover)->toBe('https://drive.google.com/file/d/cover1/view')
        ->and($naskah->sumber_form)->toBe('Form Pengajuan Naskah')
        ->and($naskah->tanggal_pengajuan->isToday())->toBeTrue()
        ->and($naskah->status->value)->toBe('data_diterima')
        ->and($naskah->progress)->toBe(5);
});

test('webhook menyimpan seluruh data tambahan dari form', function () {
    webhookPost([
        'judul' => 'Buku Data Lengkap',
        'nama' => 'Dr. Penulis Lengkap',
        'jenis_identitas' => 'nip',
        'nomor_identitas' => '198501012010012001',
        'email' => 'lengkap@example.com',
        'status' => 'Dosen',
        'fakultas_sekolah' => 'Fakultas Teknik',
        'nomor_npwp' => '123456789012345',
        'nomor_whatsapp' => '081234567890',
        'penulis_tambahan' => 'Penulis Kedua, Penulis Ketiga',
        'kebijakan_akses' => 'Terbuka',
        'biaya' => 'Gratis',
        'nama_narahubung' => 'Narahubung Satu',
        'nomor_whatsapp_narahubung' => '089876543210',
        'email_narahubung' => 'narahubung@example.com',
        'link_dummy_upload' => 'https://drive.google.com/file/d/upload1/view',
        'link_dummy_pdf' => 'https://drive.google.com/file/d/pdf1/view',
        'link_dummy_word' => 'https://drive.google.com/file/d/word1/view',
        'link_surat_keaslian' => 'https://drive.google.com/file/d/keaslian1/view',
        'link_surat_penerbitan' => 'https://drive.google.com/file/d/penerbitan1/view',
    ])->assertCreated();

    $naskah = Naskah::where('judul', 'Buku Data Lengkap')->with('author')->first();

    expect($naskah)->not->toBeNull();
    expect($naskah->author)->toMatchArray([
        'status' => 'Dosen',
        'fakultas_sekolah' => 'Fakultas Teknik',
        'nomor_npwp' => '123456789012345',
        'nomor_whatsapp' => '081234567890',
        'penulis_tambahan' => 'Penulis Kedua, Penulis Ketiga',
    ]);
    expect($naskah)->toMatchArray([
        'kebijakan_akses' => 'Terbuka',
        'biaya' => 'Gratis',
        'nama_narahubung' => 'Narahubung Satu',
        'nomor_whatsapp_narahubung' => '089876543210',
        'email_narahubung' => 'narahubung@example.com',
        'link_dummy_upload' => 'https://drive.google.com/file/d/upload1/view',
        'link_dummy_pdf' => 'https://drive.google.com/file/d/pdf1/view',
        'link_dummy_word' => 'https://drive.google.com/file/d/word1/view',
        'link_surat_keaslian' => 'https://drive.google.com/file/d/keaslian1/view',
        'link_surat_penerbitan' => 'https://drive.google.com/file/d/penerbitan1/view',
    ]);
});

test('webhook tetap menyimpan data walau email atau link tidak valid', function () {
    $response = webhookPost([
        'judul' => 'Buku Data Anomali',
        'nama' => 'Penulis Anomali',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '777000777',
        'email' => 'bukan-email@@',
        'link_cover' => 'not-a-real-url',
        'email_narahubung' => 'juga-bukan-email',
        'link_surat_keaslian' => 'ftp://invalid-link',
    ]);

    $response->assertCreated();

    $naskah = Naskah::where('judul', 'Buku Data Anomali')->with('author')->first();

    expect($naskah)->not->toBeNull();
    expect($naskah->author->email)->toBe('bukan-email@@');
    expect($naskah->email_narahubung)->toBe('juga-bukan-email');
    expect($naskah->link_cover)->toBe('not-a-real-url');
    expect($naskah->link_surat_keaslian)->toBe('ftp://invalid-link');
});

test('webhook menolak data tanpa judul, nama, atau nomor identitas', function () {
    webhookPost(['judul' => '', 'nama' => '', 'nomor_identitas' => ''])->assertUnprocessable();
});

test('webhook memakai tanggal pengajuan dari payload', function () {
    webhookPost([
        'judul' => 'Buku Dua',
        'nama' => 'Penulis Dua',
        'jenis_identitas' => 'nip',
        'nomor_identitas' => '19900101',
        'tanggal_pengajuan' => '2026-01-15 14:30:45',
    ]);

    $naskah = Naskah::where('judul', 'Buku Dua')->first();

    expect($naskah->tanggal_pengajuan->toDateTimeString())->toBe('2026-01-15 14:30:45');
});

test('webhook membuat histori workflow sistem', function () {
    webhookPost([
        'judul' => 'Buku Tiga',
        'nama' => 'Penulis Tiga',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010003',
    ]);

    $history = WorkflowHistory::first();

    expect($history)->not->toBeNull()
        ->and($history->aktor->value)->toBe(AktorType::Sistem->value)
        ->and($history->ke_status->value)->toBe('data_diterima');
});

test('webhook tidak menduplikasi naskah pada pengiriman ulang dengan timestamp sama', function () {
    $payload = [
        'judul' => 'Buku Empat',
        'nama' => 'Penulis Empat',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010004',
        'tanggal_pengajuan' => '2026-01-20 10:30:00',
    ];

    webhookPost($payload)->assertCreated();
    $response = webhookPost($payload);

    $response->assertOk()->assertJson(['status' => 'already_exists']);

    expect(Naskah::where('judul', 'Buku Empat')->count())->toBe(1);
});

test('webhook membuat data baru bila jam pengajuan berbeda walau tanggal sama', function () {
    $payload = [
        'judul' => 'Buku Enam',
        'nama' => 'Penulis Enam',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010006',
    ];

    webhookPost([...$payload, 'tanggal_pengajuan' => '2026-01-20 10:30:00'])->assertCreated();
    webhookPost([...$payload, 'tanggal_pengajuan' => '2026-01-20 14:00:00'])->assertCreated();

    expect(Naskah::where('judul', 'Buku Enam')->count())->toBe(2);
});

test('webhook memakai ulang penulis yang sudah ada', function () {
    $author = Author::create([
        'nama' => 'Penulis Lama',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010005',
        'email' => 'lama@example.com',
    ]);

    webhookPost([
        'judul' => 'Buku Lima',
        'nama' => 'Penulis Lama',
        'jenis_identitas' => 'nim',
        'nomor_identitas' => '2025010005',
    ])->assertCreated();

    expect(Author::count())->toBe(1);

    $naskah = Naskah::where('author_id', $author->id)->first();

    expect($naskah)->not->toBeNull()
        ->and($naskah->judul)->toBe('Buku Lima');
});

test('webhook mengembalikan 422 untuk data tidak valid', function () {
    webhookPost([
        'judul' => '',
        'nama' => '',
        'jenis_identitas' => 'nope',
        'nomor_identitas' => '',
    ])->assertUnprocessable();
});
