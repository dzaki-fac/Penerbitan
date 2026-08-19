<?php

namespace App\Http\Requests\Admin;

use App\Enums\NaskahStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IsbnRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isTerbit = $this->input('to_status') === NaskahStatus::IsbnTerbit->value;

        return [
            'to_status' => ['required', Rule::in([
                NaskahStatus::IsbnTerbit->value,
                NaskahStatus::RevisiIsbn->value,
                NaskahStatus::PengajuanIsbn->value,
            ])],
            'nomor_isbn' => [$isTerbit ? 'required' : 'nullable', 'string', 'max:255'],
            'penerbit' => [$isTerbit ? 'required' : 'nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string'],
        ];
    }
}
