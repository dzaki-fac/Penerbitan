<?php

namespace App\Http\Controllers;

use App\Enums\AktorType;
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
    public function search(TrackingSearchRequest $request): Response|RedirectResponse
    {
        $jenis = $request->validated('jenis_identitas');
        $nilai = $request->validated('nomor_identitas');

        $author = $jenis === 'email'
            ? Author::where('email', $nilai)->first()
            : Author::where('jenis_identitas', $jenis)
                ->where('nomor_identitas', $nilai)
                ->first();

        if (! $author) {
            return back()->withErrors([
                'nomor_identitas' => $jenis === 'email'
                    ? __('Data penulis dengan email tersebut tidak ditemukan.')
                    : __('Data penulis dengan identitas tersebut tidak ditemukan.'),
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
                'jenis_identitas' => $jenis === 'email' ? 'Email' : $author->jenis_identitas->label(),
                'nomor_identitas' => $jenis === 'email' ? $author->email : $author->nomor_identitas,
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
                'link_cover' => $naskah->link_cover,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label(), 'stage' => $naskah->status->stage()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
                'author' => [
                    'nama' => $naskah->author->nama,
                    'jenis_identitas' => $naskah->author->jenis_identitas->label(),
                    'nomor_identitas' => $naskah->author->nomor_identitas,
                ],
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
                    'file_url' => $r->file_path ? Storage::disk('public')->url($r->file_path) : null,
                ]),
                'histories' => $naskah->histories->map(fn ($h) => [
                    'id' => $h->id,
                    'dari_status' => $h->dari_status ? ['value' => $h->dari_status->value, 'label' => $h->dari_status->label(), 'stage' => $h->dari_status->stage()] : null,
                    'ke_status' => ['value' => $h->ke_status->value, 'label' => $h->ke_status->label(), 'stage' => $h->ke_status->stage()],
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
     * Penulis mengonfirmasi telah mengunggah revisi dokumen/naskah ke link Drive.
     */
    public function uploadRevisi(Naskah $naskah, UploadRevisiRequest $request): RedirectResponse
    {
        if (! in_array($naskah->status, [NaskahStatus::RevisiDokumen, NaskahStatus::RevisiEditingLayout], true)) {
            abort(404);
        }

        if (! WorkflowService::verifyAuthor($naskah, $request->validated('jenis_identitas'), $request->validated('nomor_identitas'))) {
            return back()->withErrors([
                'nomor_identitas' => __('Identitas tidak cocok dengan naskah ini.'),
            ]);
        }

        RevisiUpload::create([
            'naskah_id' => $naskah->id,
            'author_id' => $naskah->author_id,
            'jenis' => $naskah->status === NaskahStatus::RevisiDokumen
                ? RevisiJenis::Dokumen
                : RevisiJenis::Naskah,
            'catatan_penulis' => $request->validated('catatan_penulis'),
        ]);

        $to = $naskah->status === NaskahStatus::RevisiDokumen
            ? NaskahStatus::VerifikasiDokumen
            : NaskahStatus::DalamProsesEditingLayout;

        WorkflowService::transition($naskah, $to, AktorType::Penulis, note: __('Penulis mengonfirmasi revisi telah diunggah ke link Drive'));

        flashSuccess(__('Konfirmasi upload revisi berhasil.'));

        return back();
    }

    /**
     * Penulis menyetujui (Acc) hasil proof reading.
     */
    public function approveProofReading(Naskah $naskah, TrackingIdentityRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::ProofReadingPenulis) {
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

        WorkflowService::transition($naskah, NaskahStatus::AccProofReading, AktorType::Penulis, note: __('Proof reading disetujui (Acc) oleh penulis'));

        flashSuccess(__('Proof reading disetujui.'));

        return back();
    }

    /**
     * Penulis mengajukan revisi hasil proof reading.
     */
    public function rejectProofReading(Naskah $naskah, TrackingRejectRequest $request): RedirectResponse
    {
        if ($naskah->status !== NaskahStatus::ProofReadingPenulis) {
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
            NaskahStatus::RevisiProofReading,
            AktorType::Penulis,
            note: __('Penulis mengajukan revisi proof reading: ').$request->validated('catatan'),
        );

        flashSuccess(__('Revisi proof reading diajukan.'));

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

        WorkflowService::transition($naskah, NaskahStatus::Selesai, AktorType::Penulis, note: __('Buku ditandai telah diambil oleh penulis'));

        flashSuccess(__('Buku telah ditandai diambil.'));

        return back();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function actionFor(NaskahStatus $status): ?array
    {
        return match ($status) {
            NaskahStatus::RevisiDokumen, NaskahStatus::RevisiEditingLayout => [
                'jenis' => 'upload_revisi',
                'label' => 'Upload Revisi',
            ],
            NaskahStatus::ProofReadingPenulis => [
                'jenis' => 'review',
                'label' => 'Acc / Ajukan Revisi',
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
            'link_cover' => $naskah->link_cover,
            'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
            'progress' => $naskah->progress,
            'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
        ];
    }
}
