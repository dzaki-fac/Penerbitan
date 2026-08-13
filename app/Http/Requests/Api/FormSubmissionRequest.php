<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FormSubmissionRequest extends FormRequest
{
    /**
     * Webhook hanya boleh dipanggil oleh pihak yang memegang token.
     */
    public function authorize(): bool
    {
        $token = $this->bearerToken();

        return $token !== null
            && config('app.form_submission_token') !== null
            && hash_equals(config('app.form_submission_token'), $token);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'form' => ['nullable', 'string', 'max:255'],
            'judul' => ['required', 'string', 'max:255'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_identitas' => ['required', 'in:nim,nip'],
            'nomor_identitas' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'max:255'],
            'link_cover' => ['nullable', 'string', 'max:2000'],
            'tanggal_pengajuan' => ['nullable', 'date'],

            'status' => ['nullable', 'string', 'max:255'],
            'fakultas_sekolah' => ['nullable', 'string', 'max:255'],
            'nomor_npwp' => ['nullable', 'string', 'max:255'],
            'nomor_whatsapp' => ['nullable', 'string', 'max:255'],
            'penulis_tambahan' => ['nullable', 'string', 'max:500'],

            'kebijakan_akses' => ['nullable', 'string', 'max:500'],
            'biaya' => ['nullable', 'string', 'max:255'],
            'nama_narahubung' => ['nullable', 'string', 'max:255'],
            'nomor_whatsapp_narahubung' => ['nullable', 'string', 'max:255'],
            'email_narahubung' => ['nullable', 'string', 'max:255'],
            'link_dummy_upload' => ['nullable', 'string', 'max:2000'],
            'link_dummy_pdf' => ['nullable', 'string', 'max:2000'],
            'link_dummy_word' => ['nullable', 'string', 'max:2000'],
            'link_surat_keaslian' => ['nullable', 'string', 'max:2000'],
            'link_surat_penerbitan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tanggal_pengajuan' => $this->input('tanggal_pengajuan') ?? now()->format('Y-m-d H:i:s'),
        ]);
    }
}
