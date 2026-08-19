<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NaskahCatatanRequest;
use App\Models\Naskah;
use App\Models\NaskahCatatan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NaskahCatatanController extends Controller
{
    /**
     * Menampilkan seluruh catatan untuk sebuah naskah.
     */
    public function index(Naskah $naskah, Request $request)
    {
        $query = $naskah->catatan()->orderBy('created_at', 'asc');

        if ($type = $request->query('target_type')) {
            $query->where('target_type', $type);
        }

        return response()->json($query->get()->map(fn (NaskahCatatan $catatan) => [
            'id' => $catatan->id,
            'author_name' => $catatan->author_name,
            'isi' => $catatan->isi,
            'target_type' => $catatan->target_type,
            'target_value' => $catatan->target_value,
            'waktu' => $catatan->created_at->format('d M Y H:i'),
        ]));
    }

    /**
     * Menambahkan catatan baru pada naskah (admin only).
     */
    public function store(Naskah $naskah, NaskahCatatanRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        NaskahCatatan::create([
            'naskah_id' => $naskah->id,
            'author_name' => $request->user()->nickname ?? $request->user()->nama_lengkap,
            'isi' => $validated['isi'],
            'target_type' => $validated['target_type'],
            'target_value' => $validated['target_value'],
        ]);

        flashSuccess(__('Catatan berhasil ditambahkan.'));

        return back();
    }
}
