<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadRevisiRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jenis_identitas' => ['required', 'in:nim,nip'],
            'nomor_identitas' => ['required', 'string', 'max:50'],
            'catatan_penulis' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
