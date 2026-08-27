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
            'status' => ['nullable', 'string', 'max:255'],
            'fakultas_sekolah' => ['required', 'string', 'max:255'],
            'nomor_npwp' => ['nullable', 'string', 'max:255'],
            'nomor_whatsapp' => ['nullable', 'string', 'max:255'],
            'penulis_tambahan' => ['nullable', 'string', 'max:500'],
            'judul' => ['required', 'string', 'max:255'],
            'link_cover' => ['nullable', 'url', 'max:500'],
            'tanggal_pengajuan' => ['required', 'date'],
            'sumber_form' => ['nullable', 'string', 'max:255'],
            'kebijakan_akses' => ['nullable', 'string', 'max:500'],
            'biaya' => ['nullable', 'string', 'max:255'],
            'nama_narahubung' => ['nullable', 'string', 'max:255'],
            'nomor_whatsapp_narahubung' => ['nullable', 'string', 'max:255'],
            'email_narahubung' => ['nullable', 'email', 'max:255'],
            'link_dummy_upload' => ['nullable', 'url', 'max:2000'],
            'link_dummy_pdf' => ['nullable', 'url', 'max:2000'],
            'link_dummy_word' => ['nullable', 'url', 'max:2000'],
            'link_surat_keaslian' => ['nullable', 'url', 'max:2000'],
            'link_surat_penerbitan' => ['nullable', 'url', 'max:2000'],
        ];
    }
}
