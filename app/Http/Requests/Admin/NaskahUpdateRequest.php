<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NaskahUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:255'],
            'link_cover' => ['nullable', 'url', 'max:500'],
            'tanggal_pengajuan' => ['required', 'date'],
            'sumber_form' => ['nullable', 'string', 'max:255'],
        ];
    }
}
