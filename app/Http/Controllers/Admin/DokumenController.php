<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DokumenStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DokumenUpdateRequest;
use App\Models\Dokumen;
use Illuminate\Http\RedirectResponse;

class DokumenController extends Controller
{
    /**
     * Memperbarui status dan file dokumen.
     */
    public function update(Dokumen $dokumen, DokumenUpdateRequest $request): RedirectResponse
    {
        $dokumen->status = DokumenStatus::from($request->validated('status'));
        $dokumen->catatan = $request->validated('catatan');

        if ($request->hasFile('file')) {
            $dokumen->file_path = $request->file('file')->store('dokumen', 'public');
        }

        $dokumen->save();

        flashSuccess(__('Dokumen :nama diperbarui.', ['nama' => $dokumen->nama_dokumen]));

        return back();
    }
}
