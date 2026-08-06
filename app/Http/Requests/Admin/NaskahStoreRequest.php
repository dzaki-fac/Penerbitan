<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NaskahStoreRequest extends FormRequest
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
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'judul' => ['required', 'string', 'max:255'],
            'abstrak' => ['nullable', 'string'],
            'kategori' => ['required', 'string', 'max:255'],
            'tanggal_pengajuan' => ['required', 'date'],
            'sumber_form' => ['required', 'string', 'max:255'],
            'dokumen' => ['required', 'array', 'min:1'],
            'dokumen.*' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'dokumen.*' => 'nama dokumen',
        ];
    }
}
