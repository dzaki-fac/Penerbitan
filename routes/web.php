<?php

use App\Http\Controllers\Admin\AkunController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NaskahController;
use App\Http\Controllers\Admin\WorkflowController;
use App\Http\Controllers\HomeController;
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

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('tracking', [TrackingController::class, 'index'])->name('tracking');
Route::post('tracking', [TrackingController::class, 'search'])->name('tracking.search');
Route::get('tracking/{naskah}', [TrackingController::class, 'detail'])->name('tracking.detail');
Route::post('tracking/{naskah}/revisi', [TrackingController::class, 'uploadRevisi'])->name('tracking.revisi');
Route::post('tracking/{naskah}/proof-reading/approve', [TrackingController::class, 'approveProofReading'])->name('tracking.proofreading.approve');
Route::post('tracking/{naskah}/proof-reading/reject', [TrackingController::class, 'rejectProofReading'])->name('tracking.proofreading.reject');
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
        Route::post('naskah/{naskah}/confirm-revisi', [WorkflowController::class, 'confirmRevisi'])->name('naskah.confirm-revisi');
        Route::post('naskah/{naskah}/proof-reading/approve', [WorkflowController::class, 'approveProofReading'])->name('naskah.approve-proof-reading');
        Route::post('naskah/{naskah}/proof-reading/reject', [WorkflowController::class, 'rejectProofReading'])->name('naskah.reject-proof-reading');
        Route::post('naskah/{naskah}/diambil', [WorkflowController::class, 'markDiambil'])->name('naskah.mark-diambil');
        Route::post('naskah/{naskah}/layout', [WorkflowController::class, 'uploadLayout'])->name('naskah.layout.store');
        Route::post('naskah/{naskah}/isbn', [WorkflowController::class, 'updateIsbn'])->name('naskah.isbn.update');
        Route::patch('naskah/{naskah}/history/{history}', [WorkflowController::class, 'updateHistoryCatatan'])->name('naskah.history.update');
    });
});
