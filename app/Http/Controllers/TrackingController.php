<?php

namespace App\Http\Controllers;

use App\Enums\AktorType;
use App\Enums\IsbnStatus;
use App\Enums\LayoutStatus;
use App\Enums\NaskahStatus;
use App\Enums\RevisiJenis;
use App\Http\Requests\Tracking\TrackingIdentityRequest;
use App\Http\Requests\Tracking\TrackingRejectRequest;
use App\Http\Requests\Tracking\TrackingSearchRequest;
use App\Http\Requests\Tracking\UploadRevisiRequest;
use App\Models\Author;
use App\Models\Naskah;
use App\Models\RevisiUpload;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    /**
     * Menampilkan halaman form tracking.
     */
    public function index(): Response
    {
        return Inertia::render('tracking/index');
    }

    /**
     * Mencari seluruh naskah milik penulis berdasarkan identitas.
     */
    public function search(TrackingSearchRequest $request): Response
    {
        $author = Author::where('jenis_identitas', $request->validated('jenis_identitas'))
            ->where('nomor_identitas', $request->validated('nomor_identitas'))
            ->first();

        if (! $author) {
            return back()->withErrors([
                'nomor_identitas' => __('Data penulis dengan identitas tersebut tidak ditemukan.'),
            ]);
        }

        $naskahs = $author->naskahs()
            ->with(['latestLayout'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Naskah $naskah) => $this->card($naskah));

        return Inertia::render('tracking/result', [
            'author' => [
                'nama' => $author->nama,
                'jenis_identitas' => $author->jenis_identitas->label(),
                'nomor_identitas' => $author->nomor_identitas,
            ],
            'naskahs' => $naskahs,
        ]);
    }

    /**
     * Menampilkan detail tracking naskah.
     */
    public function detail(Naskah $naskah): Response
    {
        $naskah->load([
            'author',
            'dokumens',
            'layouts',
            'isbn',
            'revisiUploads',
            'histories.admin',
        ]);

        $latestLayout = $naskah->layouts->first();

        return Inertia::render('tracking/detail', [
            'naskah' => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'abstrak' => $naskah->abstrak,
                'kategori' => $naskah->kategori,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
                'catatan_admin' => $naskah->catatan_admin,
                'author' => [
                    'nama' => $naskah->author->nama,
                    'jenis_identitas' => $naskah->author->jenis_identitas->label(),
                    'nomor_identitas' => $naskah->author->nomor_identitas,
                ],
                'dokumens' => $naskah->dokumens->map(fn ($d) => [
                    'id' => $d->id,
                    'nama_dokumen' => $d->nama_dokumen,
                    'status' => ['value' => $d->status->value, 'label' => $d->status->label()],
                    'catatan' => $d->catatan,
                    'file_url' => $d->file_path ? Storage::disk('public')->url($d->file_path) : null,
                ]),
                'layout' => $latestLayout ? [
                    'id' => $latestLayout->id,
                    'versi' => $latestLayout->versi,
                    'preview_pdf_link' => $latestLayout->preview_pdf_link,
                    'status' => ['value' => $latestLayout->status->value, 'label' => $latestLayout->status->label()],
                    'catatan_revisi' => $latestLayout->catatan_revisi,
                ] : null,
                'isbn' => $naskah->isbn ? [
                    'id' => $naskah->isbn->id,
                    'nomor_isbn' => $naskah->isbn->nomor_isbn,
                    'penerbit' => $naskah->isbn->penerbit,
                    'status' => ['value' => $naskah->isbn->status->value, 'label' => $naskah->isbn->status->label()],
                    'catatan' => $naskah->isbn->catatan,
                ] : null,
                'revisi_uploads' => $naskah->revisiUploads->map(fn ($r) => [
                    'id' => $r->id,
                    'jenis' => ['value' => $r->jenis->value, 'label' => $r->jenis->label()],
                    'catatan_penulis' => $r->catatan_penulis,
                    'tanggal' => $r->created_at->format('d M Y H:i'),
                    'file_url' => Storage::disk('public')->url($r->file_path),
                ]),
                'histories' => $naskah->histories->map(fn ($h) => [
                    'id' => $h->id,
                    'dari_status' => $h->dari_status ? ['value' => $h->dari_status->value, 'label' => $h->dari_status->label()] : null,
                    'ke_status' => ['value' => $h->ke_status->value, 'label' => $h->ke_status->label()],
                    'aktor' => ['value' => $h->aktor->value, 'label' => $h->aktor->label()],
                    'admin' => $h->admin?->name,
                    'catatan' => $h->catatan,
                    'waktu' => $h->created_at->format('d M Y H:i'),
                ]),
            ],
            'steps' => WorkflowService::steps(),
            'action' => $this->actionFor($naskah->status),
        ]);
    }

    /**
     * Penulis mengunggah revisi dokumen/naskah.
     */
    public function uploadRevisi(Naskah $naskah, UploadRevisiRequest $request): RedirectResponse
    {
        if (! in_array($naskah->status, [NaskahStatus::MenungguPerbaikanDokumen, NaskahStatus::RevisiPenulis], true)) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        $path = $request->file('file')->store('revisi', 'public');

        RevisiUpload::create([
            'naskah_id' => $naskah->id,
            'author_id' => $naskah->author_id,
            'jenis' => $naskah->status === NaskahStatus::MenungguPerbaikanDokumen
                ? RevisiJenis::Dokumen
                : RevisiJenis::Naskah,
            'file_path' => $path,
            'catatan_penulis' => $request->validated('catatan_penulis'),
        ]);

        $to = $naskah->status === NaskahStatus::MenungguPerbaikanDokumen
            ? NaskahStatus::VerifikasiDokumen
            : NaskahStatus::DalamProsesEditing;

        WorkflowService::transition($naskah, $to, AktorType::Penulis, note: __('Revisi diunggah oleh penulis'));

        flashSuccess(__('Revisi berhasil diunggah.'));

        return back();
    }

    /**
     * Penulis menyetujui layout.
     */
    public function approveLayout(Naskah $naskah, TrackingIdentityRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::MenungguReviewLayout) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        if ($layout = $naskah->latestLayout) {
            $layout->status = LayoutStatus::Disetujui;
            $layout->save();
        }

        WorkflowService::transition($naskah, NaskahStatus::PengajuanIsbn, AktorType::Penulis, note: __('Layout disetujui oleh penulis'));

        flashSuccess(__('Layout disetujui.'));

        return back();
    }

    /**
     * Penulis mengajukan revisi layout.
     */
    public function rejectLayout(Naskah $naskah, TrackingRejectRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::MenungguReviewLayout) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        if ($layout = $naskah->latestLayout) {
            $layout->status = LayoutStatus::Revisi;
            $layout->catatan_revisi = $request->validated('catatan');
            $layout->save();
        }

        WorkflowService::transition(
            $naskah,
            NaskahStatus::RevisiLayout,
            AktorType::Penulis,
            note: __('Penulis mengajukan revisi layout: ').$request->validated('catatan'),
        );

        flashSuccess(__('Revisi layout diajukan.'));

        return back();
    }

    /**
     * Penulis menyetujui data ISBN.
     */
    public function approveIsbn(Naskah $naskah, TrackingIdentityRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::MenungguPersetujuanIsbn) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        if ($isbn = $naskah->isbn) {
            $isbn->status = IsbnStatus::Disetujui;
            $isbn->save();
        }

        WorkflowService::transition($naskah, NaskahStatus::Finalisasi, AktorType::Penulis, note: __('ISBN disetujui oleh penulis'));

        flashSuccess(__('ISBN disetujui.'));

        return back();
    }

    /**
     * Penulis mengajukan revisi data ISBN.
     */
    public function rejectIsbn(Naskah $naskah, TrackingRejectRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::MenungguPersetujuanIsbn) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        if ($isbn = $naskah->isbn) {
            $isbn->status = IsbnStatus::Revisi;
            $isbn->catatan = $request->validated('catatan');
            $isbn->save();
        }

        WorkflowService::transition(
            $naskah,
            NaskahStatus::RevisiIsbn,
            AktorType::Penulis,
            note: __('Penulis mengajukan revisi ISBN: ').$request->validated('catatan'),
        );

        flashSuccess(__('Revisi ISBN diajukan.'));

        return back();
    }

    /**
     * Penulis menandai buku telah diambil.
     */
    public function markDiambil(Naskah $naskah, TrackingIdentityRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::SiapDiambil) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        WorkflowService::transition($naskah, NaskahStatus::BukuDiambil, AktorType::Penulis, note: __('Buku ditandai telah diambil oleh penulis'));

        flashSuccess(__('Buku telah ditandai diambil.'));

        return back();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function actionFor(NaskahStatus $status): ?array
    {
        return match ($status) {
            NaskahStatus::MenungguPerbaikanDokumen, NaskahStatus::RevisiPenulis => [
                'jenis' => 'upload_revisi',
                'label' => 'Upload Revisi',
            ],
            NaskahStatus::MenungguReviewLayout, NaskahStatus::MenungguPersetujuanIsbn => [
                'jenis' => 'review',
                'label' => 'Setujui / Ajukan Revisi',
            ],
            NaskahStatus::SiapDiambil => [
                'jenis' => 'diambil',
                'label' => 'Buku Sudah Diambil',
            ],
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function card(Naskah $naskah): array
    {
        return [
            'id' => $naskah->id,
            'judul' => $naskah->judul,
            'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
            'progress' => $naskah->progress,
            'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
        ];
    }
}
