<?php

use App\Http\Controllers\Api\FormSubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Endpoint yang dipanggil oleh webhook Google Apps Script untuk
| mengimpor data pengajuan naskah dari Google Form ke database.
|
*/

Route::post('form-submissions', [FormSubmissionController::class, 'store'])
    ->name('api.form-submissions.store');
