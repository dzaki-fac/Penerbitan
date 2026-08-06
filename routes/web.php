<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DokumenController;
use App\Http\Controllers\Admin\NaskahController;
use App\Http\Controllers\Admin\WorkflowController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Public tracking — penulis tidak login, hanya NIM/NIP.
|
*/

Route::get('/', [TrackingController::class, 'index'])->name('home');
Route::get('tracking', [TrackingController::class, 'index'])->name('tracking');
Route::post('tracking', [TrackingController::class, 'search'])->name('tracking.search');
Route::get('tracking/{naskah}', [TrackingController::class, 'detail'])->name('tracking.detail');
Route::post('tracking/{naskah}/revisi', [TrackingController::class, 'uploadRevisi'])->name('tracking.revisi');
Route::post('tracking/{naskah}/layout/approve', [TrackingController::class, 'approveLayout'])->name('tracking.layout.approve');
Route::post('tracking/{naskah}/layout/reject', [TrackingController::class, 'rejectLayout'])->name('tracking.layout.reject');
Route::post('tracking/{naskah}/isbn/approve', [TrackingController::class, 'approveIsbn'])->name('tracking.isbn.approve');
Route::post('tracking/{naskah}/isbn/reject', [TrackingController::class, 'rejectIsbn'])->name('tracking.isbn.reject');
Route::post('tracking/{naskah}/diambil', [TrackingController::class, 'markDiambil'])->name('tracking.diambil');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('akun', AkunController::class)->except(['show', 'create', 'edit']);

        Route::resource('naskah', NaskahController::class)->names([
            'index' => 'naskah.index',
            'create' => 'naskah.create',
            'store' => 'naskah.store',
            'show' => 'naskah.show',
            'edit' => 'naskah.edit',
            'update' => 'naskah.update',
            'destroy' => 'naskah.destroy',
        ]);

        Route::post('naskah/{naskah}/transition', [WorkflowController::class, 'transition'])->name('naskah.transition');
        Route::post('naskah/{naskah}/layout', [WorkflowController::class, 'uploadLayout'])->name('naskah.layout.store');
        Route::post('naskah/{naskah}/isbn', [WorkflowController::class, 'updateIsbn'])->name('naskah.isbn.update');
        Route::post('naskah/{naskah}/catatan', [WorkflowController::class, 'updateCatatan'])->name('naskah.catatan.update');
        Route::patch('dokumen/{dokumen}', [DokumenController::class, 'update'])->name('dokumen.update');
    });
});

require __DIR__.'/settings.php';
