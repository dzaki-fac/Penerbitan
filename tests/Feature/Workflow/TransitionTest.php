<?php

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
use App\Exceptions\WorkflowConflictException;
use App\Models\Naskah;
use App\Models\WorkflowHistory;
use App\Services\WorkflowService;

test('transisi berhasil memindahkan status dan mencatat histori', function () {
    $naskah = Naskah::factory()->create(['status' => NaskahStatus::DataDiterima]);

    WorkflowService::transition($naskah, NaskahStatus::VerifikasiDokumen, AktorType::Admin);

    expect($naskah->refresh()->status)->toBe(NaskahStatus::VerifikasiDokumen);

    $history = WorkflowHistory::first();

    expect($history)->not->toBeNull()
        ->and($history->dari_status)->toBe(NaskahStatus::DataDiterima)
        ->and($history->ke_status)->toBe(NaskahStatus::VerifikasiDokumen);
});

test('transisi dari status yang sudah berubah melempar WorkflowConflictException', function () {
    $naskah = Naskah::factory()->create(['status' => NaskahStatus::DataDiterima]);

    // Simulasi request pertama sudah selesai memindahkan status di DB,
    // sementara request kedua masih memegang status lama.
    Naskah::whereKey($naskah->id)->update(['status' => NaskahStatus::VerifikasiDokumen]);

    WorkflowService::transition($naskah, NaskahStatus::VerifikasiDokumen, AktorType::Admin);
})->throws(WorkflowConflictException::class);

test('transisi basi tidak meninggalkan histori baru', function () {
    $naskah = Naskah::factory()->create(['status' => NaskahStatus::DataDiterima]);

    Naskah::whereKey($naskah->id)->update(['status' => NaskahStatus::VerifikasiDokumen]);

    try {
        WorkflowService::transition($naskah, NaskahStatus::VerifikasiDokumen, AktorType::Admin);
    } catch (WorkflowConflictException) {
        // Diharapkan gagal, hanya pastikan tidak ada data yang terlanjur ditulis.
    }

    expect(WorkflowHistory::count())->toBe(0);
});
