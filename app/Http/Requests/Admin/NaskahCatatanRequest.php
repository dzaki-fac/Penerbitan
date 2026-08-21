<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NaskahCatatanRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'isi' => ['required', 'string'],
            'target_type' => ['required', 'in:general,stage'],
            'target_value' => ['nullable', 'string'],
        ];
    }
}
