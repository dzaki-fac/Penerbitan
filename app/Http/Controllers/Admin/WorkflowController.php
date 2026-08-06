<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AktorType;
use App\Enums\IsbnStatus;
use App\Enums\LayoutStatus;
use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IsbnRequest;
use App\Http\Requests\Admin\LayoutRequest;
use App\Http\Requests\Admin\TransitionRequest;
use App\Models\Isbn;
use App\Models\Layout;
use App\Models\Naskah;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    /**
     * Admin mengubah status workflow sesuai BPMN.
     */
    public function transition(Naskah $naskah, TransitionRequest $request): RedirectResponse
    {
        $to = NaskahStatus::from($request->validated('to_status'));

        $allowed = WorkflowService::adminTransitionsFor($naskah->status->value);

        if (! in_array($to, $allowed, true)) {
            return back()->withErrors([
                'to_status' => __('Transisi tersebut tidak diizinkan dari status saat ini.'),
            ]);
        }

        WorkflowService::transition(
            $naskah,
            $to,
            AktorType::Admin,
            admin: $request->user(),
            note: $request->validated('catatan'),
        );

        flashSuccess(__('Status naskah diperbarui menjadi :status.', ['status' => $to->label()]));

        return back();
    }

    /**
     * Admin mengunggah hasil layout + link preview PDF.
     */
    public function uploadLayout(Naskah $naskah, LayoutRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::DalamProsesEditingLayout && $naskah->status !== NaskahStatus::RevisiEditingLayout) {
            return back()->withErrors([
                'file_layout' => __('Layout hanya dapat diunggah pada status editing & layout.'),
            ]);
        }

        $versi = ($naskah->layouts()->max('versi') ?? 0) + 1;

        $layout = Layout::create([
            'naskah_id' => $naskah->id,
            'versi' => $versi,
            'file_layout' => $request->hasFile('file_layout')
                ? $request->file('file_layout')->store('layouts', 'public')
                : null,
            'preview_pdf_link' => $request->validated('preview_pdf_link'),
            'status' => LayoutStatus::MenungguReview,
        ]);

        WorkflowService::transition(
            $naskah,
            NaskahStatus::MenungguReviewEditingLayout,
            AktorType::Admin,
            admin: $request->user(),
            note: __('Layout versi :versi diunggah.', ['versi' => $versi]),
        );

        flashSuccess(__('Layout versi :versi berhasil diunggah.', ['versi' => $versi]));

        return back();
    }

    /**
     * Admin mengelola data ISBN.
     */
    public function updateIsbn(Naskah $naskah, IsbnRequest $request): RedirectResponse
    {
        if (! in_array($naskah->status, [NaskahStatus::PengajuanIsbn, NaskahStatus::RevisiIsbn], true)) {
            return back()->withErrors([
                'nomor_isbn' => __('ISBN hanya dapat dikelola pada status pengajuan ISBN.'),
            ]);
        }

        $isbn = $naskah->isbn ?? new Isbn(['naskah_id' => $naskah->id]);

        $isbn->nomor_isbn = $request->validated('nomor_isbn') ?? $isbn->nomor_isbn;
        $isbn->penerbit = $request->validated('penerbit') ?? $isbn->penerbit;
        $isbn->catatan = $request->validated('catatan') ?? $isbn->catatan;
        $isbn->status = IsbnStatus::MenungguPersetujuan;
        $isbn->save();

        WorkflowService::transition(
            $naskah,
            NaskahStatus::MenungguPersetujuanIsbn,
            AktorType::Admin,
            admin: $request->user(),
            note: __('Data ISBN diajukan untuk persetujuan penulis'),
        );

        flashSuccess(__('Data ISBN diajukan untuk persetujuan penulis.'));

        return back();
    }

    /**
     * Admin memperbarui catatan naskah.
     */
    public function updateCatatan(Naskah $naskah, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'catatan_admin' => ['required', 'string', 'max:2000'],
        ]);

        $naskah->update(['catatan_admin' => $validated['catatan_admin']]);

        flashSuccess(__('Catatan admin diperbarui.'));

        return back();
    }
}
