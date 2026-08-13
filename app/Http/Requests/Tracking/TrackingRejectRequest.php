<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TrackingRejectRequest extends FormRequest
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
            'catatan' => ['required', 'string', 'max:255'],
        ];
    }
}
