<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TrackingSearchRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jenis_identitas' => ['required', 'in:nim,nip,email'],
            'nomor_identitas' => [
                'required',
                'string',
                'max:150',
                Rule::when(
                    fn () => $this->input('jenis_identitas') === 'email',
                    ['email'],
                ),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nomor_identitas.email' => 'Format email tidak valid.',
        ];
    }
}