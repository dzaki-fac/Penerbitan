<?php

namespace App\Http\Requests\Admin;

use App\Enums\NaskahStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TransitionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'to_status' => ['required', 'in:'.implode(',', array_column(NaskahStatus::cases(), 'value'))],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'link_drive' => [
                'nullable',
                'url',
                'max:500',
                'required_if:to_status,revisi_dokumen,revisi_editing_layout,revisi_isbn,revisi_proof_reading',
            ],
            'force' => ['sometimes', 'boolean'],
        ];
    }
}
