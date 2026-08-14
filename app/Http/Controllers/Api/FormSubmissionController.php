<?php

namespace App\Http\Controllers\Api;

use App\Actions\ImportNaskahFromForm;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FormSubmissionRequest;
use Illuminate\Http\JsonResponse;

class FormSubmissionController extends Controller
{
    /**
     * Menerima data pengajuan naskah dari webhook Google Form.
     */
    public function store(FormSubmissionRequest $request, ImportNaskahFromForm $import): JsonResponse
    {
        $result = $import->run($request->validated());

        return response()->json(
            $result,
            $result['status'] === 'created' ? 201 : 200,
        );
    }
}
