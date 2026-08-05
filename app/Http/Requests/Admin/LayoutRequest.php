<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LayoutRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file_layout' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'preview_pdf_link' => ['nullable', 'string', 'max:500'],
        ];
    }
}
