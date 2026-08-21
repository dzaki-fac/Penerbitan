<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AktorType;
use App\Enums\IsbnStatus;
use App\Enums\LayoutStatus;
use App\Enums\NaskahStatus;
use App\Enums\RevisiJenis;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IsbnRequest;
use App\Http\Requests\Admin\LayoutRequest;
use App\Http\Requests\Admin\TransitionRequest;
use App\Models\Isbn;
use App\Models\Layout;
use App\Models\Naskah;
use App\Models\RevisiUpload;
use App\Models\WorkflowHistory;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkflowController extends Controller
{
    /**
     * Admin mengubah status workflow sesuai BPMN.
     */
    public function transition(Naskah $naskah, TransitionRequest $request): RedirectResponse
    {
        $to = NaskahStatus::from($request->validated('to_status'));

        $force = (bool) $request->validated('force');

        if ($to === $naskah->status) {
            return back()->withErrors([
                'to_status' => __('Naskah sudah berada pada status tersebut.'),
            ]);
        }

        $allowed = WorkflowService::adminTransitionsFor($naskah->status->value);

        if (! $force && ! in_array($to, $allowed, true)) {
            return back()->withErrors([
                'to_status' => __('Transisi tersebut tidak diizinkan dari status saat ini.'),
            ]);
        }

        DB::transaction(function () use ($naskah, $to, $request) {
            WorkflowService::assertFreshStatus($naskah, $naskah->status);

            $this->syncIsbnStatus($naskah->isbn, $to);

            WorkflowService::transition(
                $naskah,
                $to,
                AktorType::Admin,
                admin: $request->user(),
                note: $request->validated('catatan'),
            );
        });

        flashSuccess(__('Status naskah diperbarui menjadi :status.', ['status' => $to->label()]));

        return back();
    }

    /**
     * Admin mengonfirmasi upload revisi atas nama penulis.
     */
    public function confirmRevisi(Naskah $naskah, Request $request): RedirectResponse
    {
        if (! in_array($naskah->status, [NaskahStatus::RevisiDokumen, NaskahStatus::RevisiEditingLayout], true)) {
            abort(404);
        }

        $validated = $request->validate([
            'catatan' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($naskah, $request, $validated) {
            WorkflowService::assertFreshStatus($naskah, $naskah->status);

            RevisiUpload::create([
                'naskah_id' => $naskah->id,
                'author_id' => $naskah->author_id,
                'jenis' => $naskah->status === NaskahStatus::RevisiDokumen
                    ? RevisiJenis::Dokumen
                    : RevisiJenis::Naskah,
                'catatan_penulis' => $validated['catatan'],
            ]);

            $to = $naskah->status === NaskahStatus::RevisiDokumen
                ? NaskahStatus::VerifikasiDokumen
                : NaskahStatus::DalamProsesEditingLayout;

            WorkflowService::transition(
                $naskah,
                $to,
                AktorType::Admin,
                admin: $request->user(),
                note: __('Admin mengonfirmasi revisi telah diunggah'),
            );
        });

        flashSuccess(__('Upload revisi dikonfirmasi.'));

        return back();
    }

    /**
     * Admin menyetujui hasil proof reading atas nama penulis (Acc).
     */
    public function approveProofReading(Naskah $naskah, Request $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::ProofReadingPenulis) {
            abort(404);
        }

        DB::transaction(function () use ($naskah, $request) {
            WorkflowService::assertFreshStatus($naskah, NaskahStatus::ProofReadingPenulis);

            if ($layout = $naskah->latestLayout) {
                $layout->status = LayoutStatus::Disetujui;
                $layout->save();
            }

            WorkflowService::transition(
                $naskah,
                NaskahStatus::AccProofReading,
                AktorType::Admin,
                admin: $request->user(),
                note: __('Final review disetujui (Acc) oleh admin'),
            );
        });

        flashSuccess(__('Final review disetujui.'));

        return back();
    }

    /**
     * Admin mengajukan revisi hasil proof reading atas nama penulis.
     */
    public function rejectProofReading(Naskah $naskah, Request $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::ProofReadingPenulis) {
            abort(404);
        }

        $validated = $request->validate([
            'catatan' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($naskah, $request, $validated) {
            WorkflowService::assertFreshStatus($naskah, NaskahStatus::ProofReadingPenulis);

            if ($layout = $naskah->latestLayout) {
                $layout->status = LayoutStatus::Revisi;
                $layout->catatan_revisi = $validated['catatan'];
                $layout->save();
            }

            WorkflowService::transition(
                $naskah,
                NaskahStatus::RevisiProofReading,
                AktorType::Admin,
                admin: $request->user(),
                note: __('Revisi final review diajukan oleh admin: ').$validated['catatan'],
            );
        });

        flashSuccess(__('Revisi final review diajukan.'));

        return back();
    }

    /**
     * Admin menandai buku telah diambil atas nama penulis.
     */
    public function markDiambil(Naskah $naskah, Request $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::SiapDiambil) {
            abort(404);
        }

        WorkflowService::transition(
            $naskah,
            NaskahStatus::Selesai,
            AktorType::Admin,
            admin: $request->user(),
            note: __('Buku ditandai telah diambil oleh admin'),
        );

        flashSuccess(__('Buku telah ditandai diambil.'));

        return back();
    }

    /**
     * Admin mengirim hasil layout berupa link preview PDF.
     */
    public function uploadLayout(Naskah $naskah, LayoutRequest $request): RedirectResponse
    {
        $validStatuses = [
            NaskahStatus::DalamProsesEditingLayout,
            NaskahStatus::RevisiEditingLayout,
            NaskahStatus::RevisiProofReading,
        ];

        if (! in_array($naskah->status, $validStatuses, true)) {
            return back()->withErrors([
                'preview_pdf_link' => __('Layout hanya dapat dikirim pada tahap editing & layout atau revisi final review.'),
            ]);
        }

        $versi = null;

        DB::transaction(function () use ($naskah, $request, &$versi) {
            WorkflowService::assertFreshStatus($naskah, $naskah->status);

            $versi = ($naskah->layouts()->max('versi') ?? 0) + 1;

            Layout::create([
                'naskah_id' => $naskah->id,
                'versi' => $versi,
                'preview_pdf_link' => $request->validated('preview_pdf_link'),
                'status' => LayoutStatus::MenungguReview,
            ]);

            if ($naskah->status === NaskahStatus::RevisiProofReading) {
                WorkflowService::transition(
                    $naskah,
                    NaskahStatus::ProofReadingPenulis,
                    AktorType::Admin,
                    admin: $request->user(),
                    note: __('Layout versi :versi dikirim untuk final review ulang.', ['versi' => $versi]),
                );
            }
        });

        flashSuccess(__('Layout versi :versi berhasil dikirim.', ['versi' => $versi]));

        return back();
    }

    /**
     * Admin mengelola data ISBN sekaligus memindahkan status naskah.
     */
    public function updateIsbn(Naskah $naskah, IsbnRequest $request): RedirectResponse
    {
        if (! in_array($naskah->status, [NaskahStatus::PengajuanIsbn, NaskahStatus::RevisiIsbn], true)) {
            return back()->withErrors([
                'to_status' => __('ISBN hanya dapat dikelola pada tahap pengajuan ISBN.'),
            ]);
        }

        $to = NaskahStatus::from($request->validated('to_status'));

        $allowed = WorkflowService::adminTransitionsFor($naskah->status->value);

        if (! in_array($to, $allowed, true)) {
            return back()->withErrors([
                'to_status' => __('Transisi tersebut tidak diizinkan dari status saat ini.'),
            ]);
        }

        DB::transaction(function () use ($naskah, $request, $to) {
            WorkflowService::assertFreshStatus($naskah, $naskah->status);

            $isbn = $naskah->isbn;

            if ($to === NaskahStatus::IsbnTerbit) {
                $isbn ??= new Isbn(['naskah_id' => $naskah->id]);

                $isbn->nomor_isbn = $request->validated('nomor_isbn');
                $isbn->penerbit = $request->validated('penerbit');
                $isbn->catatan = $request->validated('catatan');
                $isbn->status = IsbnStatus::Proses;
                $isbn->save();
            }

            $this->syncIsbnStatus($isbn, $to);

            WorkflowService::transition(
                $naskah,
                $to,
                AktorType::Admin,
                admin: $request->user(),
                note: $request->validated('catatan'),
            );
        });

        flashSuccess($to === NaskahStatus::IsbnTerbit
            ? __('Data ISBN terbit disimpan dan status diperbarui menjadi :status.', ['status' => $to->label()])
            : __('Status ISBN diperbarui menjadi :status.', ['status' => $to->label()]));

        return back();
    }

    /**
     * Menyelaraskan status record ISBN ketika admin mencatat hasil verifikasi Perpusnas.
     */
    private function syncIsbnStatus(?Isbn $isbn, NaskahStatus $to): void
    {
        if (! $isbn) {
            return;
        }

        $isbn->status = match ($to) {
            NaskahStatus::IsbnTerbit => IsbnStatus::Terbit,
            NaskahStatus::RevisiIsbn => IsbnStatus::Revisi,
            default => $isbn->status,
        };
        $isbn->save();
    }

    /**
     * Admin mengubah catatan pada entri riwayat transisi status.
     */
    public function updateHistoryCatatan(Naskah $naskah, WorkflowHistory $history, Request $request): RedirectResponse
    {
        if ($history->naskah_id !== $naskah->id || $history->admin_id === null) {
            abort(403);
        }

        $validated = $request->validate([
            'catatan' => ['nullable', 'string'],
        ]);

        $history->update(['catatan' => $validated['catatan']]);

        flashSuccess(__('Catatan pada riwayat diperbarui.'));

        return back();
    }
}
