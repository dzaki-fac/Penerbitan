<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NaskahStoreRequest;
use App\Http\Requests\Admin\NaskahUpdateRequest;
use App\Models\Author;
use App\Models\Naskah;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NaskahController extends Controller
{
    /**
     * Menampilkan daftar naskah.
     */
    public function index(Request $request): Response
    {
        $query = Naskah::query()->with(['author']);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhereHas('author', fn ($author) => $author
                        ->where('nama', 'like', "%{$search}%")
                        ->orWhere('nomor_identitas', 'like', "%{$search}%"));
            });
        }

        if ($stageStr = $request->query('stage')) {
            $stage = (int) $stageStr;
            $query->whereIn(
                'status',
                array_map(fn (NaskahStatus $s) => $s->value, NaskahStatus::forStage($stage)),
            );
        }

        if ($request->filled('status')) {
            $status = $request->query('status');

            if ($status === NaskahStatus::IsbnTerbit->value) {
                $query->whereHas('histories', fn ($history) => $history
                    ->where('ke_status', NaskahStatus::IsbnTerbit->value));
            } else {
                $query->where('status', $status);
            }
        }

        if ($fakultas = $request->string('fakultas')->trim()->toString()) {
            $query->whereHas('author', fn ($author) => $author
                ->whereRaw('LOWER(fakultas_sekolah) = ?', [mb_strtolower($fakultas)]));
        }

        if ($dateFrom = $request->string('date_from')->trim()->toString()) {
            $query->where('tanggal_pengajuan', '>=', $dateFrom);
        }

        if ($dateTo = $request->string('date_to')->trim()->toString()) {
            $query->where('tanggal_pengajuan', '<=', $dateTo.' 23:59:59');
        }

        $sortable = [
            'judul' => 'naskahs.judul',
            'tanggal' => 'naskahs.tanggal_pengajuan',
            'status' => 'naskahs.status',
            'penulis' => 'authors.nama',
        ];
        $sortBy = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        if (isset($sortable[$sortBy])) {
            $query->orderBy($sortable[$sortBy], $sortDir);
        } else {
            $query->orderByDesc('created_at');
        }

        $perPage = $request->query('per_page', '10');
        $perPage = in_array($perPage, ['10', '20', 'all'], true) ? $perPage : '10';

        if ($perPage === 'all') {
            $perPage = $query->count() ?: 1;
        }

        $naskahs = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Naskah $naskah) => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'link_cover' => $naskah->link_cover,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y H:i'),
                'penulis' => $naskah->author->nama,
                'identitas' => $naskah->author->jenis_identitas->label().' '.$naskah->author->nomor_identitas,
                'penulis_status' => $naskah->author->status,
                'fakultas_sekolah' => $naskah->author->fakultas_sekolah,
            ]);

        return Inertia::render('admin/naskah/index', [
            'naskahs' => $naskahs,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', ''),
                'stage' => $request->query('stage', ''),
                'fakultas' => $request->query('fakultas', ''),
                'date_from' => $request->query('date_from', ''),
                'date_to' => $request->query('date_to', ''),
                'per_page' => $request->query('per_page', '10'),
                'sort_by' => $request->query('sort_by', ''),
                'sort_dir' => $request->query('sort_dir', 'desc'),
            ],
            'statuses' => collect(NaskahStatus::cases())->map(fn (NaskahStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Menampilkan form tambah naskah (dari data Google Form).
     */
    public function create(): Response
    {
        return Inertia::render('admin/naskah/create');
    }

    /**
     * Menyimpan naskah baru beserta penulis.
     */
    public function store(NaskahStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $author = Author::firstOrCreate(
            [
                'jenis_identitas' => $data['jenis_identitas'],
                'nomor_identitas' => $data['nomor_identitas'],
            ],
            [
                'nama' => $data['nama'],
                'email' => $data['email'] ?? null,
                'status' => $data['status'] ?? null,
                'fakultas_sekolah' => normalizeFakultasSekolah($data['fakultas_sekolah'] ?? null),
                'nomor_npwp' => $data['nomor_npwp'] ?? null,
                'nomor_whatsapp' => $data['nomor_whatsapp'] ?? null,
                'penulis_tambahan' => $data['penulis_tambahan'] ?? null,
            ],
        );

        $naskah = Naskah::create([
            'author_id' => $author->id,
            'judul' => $data['judul'],
            'link_cover' => $data['link_cover'] ?? null,
            'tanggal_pengajuan' => $data['tanggal_pengajuan'],
            'sumber_form' => $data['sumber_form'] ?? null,
            'kebijakan_akses' => $data['kebijakan_akses'] ?? null,
            'biaya' => $data['biaya'] ?? null,
            'nama_narahubung' => $data['nama_narahubung'] ?? null,
            'nomor_whatsapp_narahubung' => $data['nomor_whatsapp_narahubung'] ?? null,
            'email_narahubung' => $data['email_narahubung'] ?? null,
            'link_dummy_upload' => $data['link_dummy_upload'] ?? null,
            'link_dummy_pdf' => $data['link_dummy_pdf'] ?? null,
            'link_dummy_word' => $data['link_dummy_word'] ?? null,
            'link_surat_keaslian' => $data['link_surat_keaslian'] ?? null,
            'link_surat_penerbitan' => $data['link_surat_penerbitan'] ?? null,
            'status' => NaskahStatus::DataDiterima,
            'progress' => NaskahStatus::DataDiterima->progress(),
        ]);

        WorkflowService::transition(
            $naskah,
            NaskahStatus::DataDiterima,
            AktorType::Sistem,
            note: __('Naskah diimpor dari Google Form'),
        );

        flashSuccess(__('Naskah berhasil ditambahkan.'));

        return to_route('admin.naskah.show', $naskah);
    }

    /**
     * Menampilkan form edit naskah.
     */
    public function edit(Naskah $naskah): Response
    {
        return Inertia::render('admin/naskah/edit', [
            'naskah' => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'link_cover' => $naskah->link_cover,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('Y-m-d\TH:i'),
                'sumber_form' => $naskah->sumber_form,
                'kebijakan_akses' => $naskah->kebijakan_akses,
                'biaya' => $naskah->biaya,
                'nama_narahubung' => $naskah->nama_narahubung,
                'nomor_whatsapp_narahubung' => $naskah->nomor_whatsapp_narahubung,
                'email_narahubung' => $naskah->email_narahubung,
                'link_dummy_upload' => $naskah->link_dummy_upload,
                'link_dummy_pdf' => $naskah->link_dummy_pdf,
                'link_dummy_word' => $naskah->link_dummy_word,
                'link_surat_keaslian' => $naskah->link_surat_keaslian,
                'link_surat_penerbitan' => $naskah->link_surat_penerbitan,
                'penulis' => [
                    'nama' => $naskah->author->nama,
                    'email' => $naskah->author->email,
                    'jenis_identitas' => $naskah->author->jenis_identitas->label(),
                    'nomor_identitas' => $naskah->author->nomor_identitas,
                    'status' => $naskah->author->status,
                    'fakultas_sekolah' => $naskah->author->fakultas_sekolah,
                    'nomor_npwp' => $naskah->author->nomor_npwp,
                    'nomor_whatsapp' => $naskah->author->nomor_whatsapp,
                    'penulis_tambahan' => $naskah->author->penulis_tambahan,
                ],
            ],
        ]);
    }

    /**
     * Memperbarui data naskah.
     */
    public function update(Naskah $naskah, NaskahUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $naskah->author->update([
            'nama' => $data['nama'],
            'email' => $data['email'] ?? null,
            'status' => $data['status'] ?? null,
            'fakultas_sekolah' => normalizeFakultasSekolah($data['fakultas_sekolah'] ?? null),
            'nomor_npwp' => $data['nomor_npwp'] ?? null,
            'nomor_whatsapp' => $data['nomor_whatsapp'] ?? null,
            'penulis_tambahan' => $data['penulis_tambahan'] ?? null,
        ]);

        $naskah->update([
            'judul' => $data['judul'],
            'link_cover' => $data['link_cover'] ?? null,
            'tanggal_pengajuan' => $data['tanggal_pengajuan'],
            'sumber_form' => $data['sumber_form'] ?? null,
            'kebijakan_akses' => $data['kebijakan_akses'] ?? null,
            'biaya' => $data['biaya'] ?? null,
            'nama_narahubung' => $data['nama_narahubung'] ?? null,
            'nomor_whatsapp_narahubung' => $data['nomor_whatsapp_narahubung'] ?? null,
            'email_narahubung' => $data['email_narahubung'] ?? null,
            'link_dummy_upload' => $data['link_dummy_upload'] ?? null,
            'link_dummy_pdf' => $data['link_dummy_pdf'] ?? null,
            'link_dummy_word' => $data['link_dummy_word'] ?? null,
            'link_surat_keaslian' => $data['link_surat_keaslian'] ?? null,
            'link_surat_penerbitan' => $data['link_surat_penerbitan'] ?? null,
        ]);

        flashSuccess(__('Naskah berhasil diperbarui.'));

        return to_route('admin.naskah.show', $naskah);
    }

    /**
     * Menampilkan detail naskah beserta seluruh prosesnya.
     */
    public function show(Naskah $naskah): Response
    {
        $naskah->load([
            'author',
            'layouts',
            'isbn',
            'revisiUploads',
            'histories.admin',
        ]);

        return Inertia::render('admin/naskah/show', [
            'naskah' => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'link_cover' => $naskah->link_cover,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label(), 'stage' => $naskah->status->stage()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y H:i'),
                'sumber_form' => $naskah->sumber_form,
                'kebijakan_akses' => $naskah->kebijakan_akses,
                'biaya' => $naskah->biaya,
                'nama_narahubung' => $naskah->nama_narahubung,
                'nomor_whatsapp_narahubung' => $naskah->nomor_whatsapp_narahubung,
                'email_narahubung' => $naskah->email_narahubung,
                'link_dummy_upload' => $naskah->link_dummy_upload,
                'link_dummy_pdf' => $naskah->link_dummy_pdf,
                'link_dummy_word' => $naskah->link_dummy_word,
                'link_surat_keaslian' => $naskah->link_surat_keaslian,
                'link_surat_penerbitan' => $naskah->link_surat_penerbitan,
                'author' => [
                    'id' => $naskah->author->id,
                    'nama' => $naskah->author->nama,
                    'email' => $naskah->author->email,
                    'jenis_identitas' => $naskah->author->jenis_identitas->label(),
                    'nomor_identitas' => $naskah->author->nomor_identitas,
                    'status' => $naskah->author->status,
                    'fakultas_sekolah' => $naskah->author->fakultas_sekolah,
                    'nomor_npwp' => $naskah->author->nomor_npwp,
                    'nomor_whatsapp' => $naskah->author->nomor_whatsapp,
                    'penulis_tambahan' => $naskah->author->penulis_tambahan,
                ],
                'layouts' => $naskah->layouts->map(fn ($l) => [
                    'id' => $l->id,
                    'versi' => $l->versi,
                    'file_url' => $l->file_layout ? Storage::disk('public')->url($l->file_layout) : null,
                    'preview_pdf_link' => $l->preview_pdf_link,
                    'status' => ['value' => $l->status->value, 'label' => $l->status->label()],
                    'catatan_revisi' => $l->catatan_revisi,
                    'tanggal' => $l->created_at->format('d M Y H:i'),
                ]),
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
                    'admin' => $h->admin?->nickname ?? $h->admin?->nama_lengkap,
                    'catatan' => $h->catatan,
                    'can_edit_catatan' => $h->admin_id !== null,
                    'waktu' => $h->created_at->format('d M Y H:i'),
                ]),
            ],
            'steps' => WorkflowService::stepsFor($naskah->status),
            'adminTransitions' => WorkflowService::adminTransitionsFor($naskah->status->value),
            'authorAction' => WorkflowService::authorActionFor($naskah->status->value),
            'statusOptions' => collect(NaskahStatus::cases())->map(fn (NaskahStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Menghapus naskah.
     */
    public function destroy(Request $request, Naskah $naskah): RedirectResponse
    {
        $naskah->delete();

        flashSuccess(__('Naskah berhasil dihapus.'));

        return to_route('admin.naskah.index', $request->only([
            'fakultas',
            'per_page',
            'search',
            'stage',
            'status',
        ]));
    }

    /**
     * Export naskah ke CSV.
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $query = Naskah::query()->with(['author']);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhereHas('author', fn ($author) => $author
                        ->where('nama', 'like', "%{$search}%")
                        ->orWhere('nomor_identitas', 'like', "%{$search}%"));
            });
        }

        if ($stageStr = $request->query('stage')) {
            $stage = (int) $stageStr;
            $query->whereIn('status', NaskahStatus::forStage($stage));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($fakultas = $request->string('fakultas')->trim()->toString()) {
            $query->whereHas('author', fn ($author) => $author
                ->where('fakultas_sekolah', $fakultas));
        }

        if ($dateFrom = $request->string('date_from')->trim()->toString()) {
            $query->where('tanggal_pengajuan', '>=', $dateFrom);
        }

        if ($dateTo = $request->string('date_to')->trim()->toString()) {
            $query->where('tanggal_pengajuan', '<=', $dateTo.' 23:59:59');
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment;filename="naskah_'.now()->format('Ymd_His').'.csv"',
        ];

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Judul', 'Nama Penulis', 'Jenis Identitas', 'Nomor Identitas',
                'Email Penulis', 'Status Penulis', 'Fakultas/Sekolah', 'NPWP',
                'WhatsApp Penulis', 'Penulis Tambahan', 'Tanggal Pengajuan',
                'Sumber Form', 'Kebijakan Akses', 'Biaya', 'Nama Narahubung',
                'WhatsApp Narahubung', 'Email Narahubung', 'Link Cover',
                'Link Dummy Upload', 'Link Dummy PDF', 'Link Dummy Word',
                'Link Surat Keaslian', 'Link Surat Penerbitan', 'Status',
            ]);

            $query->orderByDesc('created_at')->chunk(500, function ($naskahs) use ($handle) {
                foreach ($naskahs as $naskah) {
                    fputcsv($handle, [
                        $naskah->judul,
                        $naskah->author->nama,
                        $naskah->author->jenis_identitas->value,
                        $naskah->author->nomor_identitas,
                        $naskah->author->email,
                        $naskah->author->status,
                        $naskah->author->fakultas_sekolah,
                        $naskah->author->nomor_npwp,
                        $naskah->author->nomor_whatsapp,
                        $naskah->author->penulis_tambahan,
                        $naskah->tanggal_pengajuan->format('Y-m-d H:i:s'),
                        $naskah->sumber_form,
                        $naskah->kebijakan_akses,
                        $naskah->biaya,
                        $naskah->nama_narahubung,
                        $naskah->nomor_whatsapp_narahubung,
                        $naskah->email_narahubung,
                        $naskah->link_cover,
                        $naskah->link_dummy_upload,
                        $naskah->link_dummy_pdf,
                        $naskah->link_dummy_word,
                        $naskah->link_surat_keaslian,
                        $naskah->link_surat_penerbitan,
                        $naskah->status->value,
                    ]);
                }
            });

            fclose($handle);
        }, 'naskah_'.now()->format('Ymd_His').'.csv', $headers);
    }

    /**
     * Import naskah dari CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        if ($handle === false) {
            flashError(__('Gagal membaca file CSV.'));
            return to_route('admin.naskah.index');
        }

        $header = fgetcsv($handle);
        $imported = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 4) {
                $skipped++;
                continue;
            }

            $jenisIdentitas = strtolower(trim($row[2] ?? ''));
            $nomorIdentitas = trim($row[3] ?? '');
            $judul = trim($row[0] ?? '');

            if (!$judul || !$nomorIdentitas || !in_array($jenisIdentitas, ['nim', 'nip'])) {
                $skipped++;
                continue;
            }

            $author = Author::firstOrCreate(
                [
                    'jenis_identitas' => $jenisIdentitas,
                    'nomor_identitas' => $nomorIdentitas,
                ],
                [
                    'nama' => trim($row[1] ?? ''),
                    'email' => trim($row[4] ?? '') ?: null,
                    'status' => trim($row[5] ?? '') ?: null,
                    'fakultas_sekolah' => normalizeFakultasSekolah(trim($row[6] ?? '') ?: null),
                    'nomor_npwp' => trim($row[7] ?? '') ?: null,
                    'nomor_whatsapp' => trim($row[8] ?? '') ?: null,
                    'penulis_tambahan' => trim($row[9] ?? '') ?: null,
                ],
            );

            $tanggalPengajuan = trim($row[10] ?? '') ?: now()->toDateTimeString();

            $statusValue = trim($row[23] ?? '') ?: 'data_diterima';
            $status = NaskahStatus::tryFrom($statusValue) ?? NaskahStatus::DataDiterima;

            Naskah::create([
                'author_id' => $author->id,
                'judul' => $judul,
                'link_cover' => trim($row[17] ?? '') ?: null,
                'tanggal_pengajuan' => $tanggalPengajuan,
                'sumber_form' => trim($row[11] ?? '') ?: null,
                'kebijakan_akses' => trim($row[12] ?? '') ?: null,
                'biaya' => trim($row[13] ?? '') ?: null,
                'nama_narahubung' => trim($row[14] ?? '') ?: null,
                'nomor_whatsapp_narahubung' => trim($row[15] ?? '') ?: null,
                'email_narahubung' => trim($row[16] ?? '') ?: null,
                'link_dummy_upload' => trim($row[18] ?? '') ?: null,
                'link_dummy_pdf' => trim($row[19] ?? '') ?: null,
                'link_dummy_word' => trim($row[20] ?? '') ?: null,
                'link_surat_keaslian' => trim($row[21] ?? '') ?: null,
                'link_surat_penerbitan' => trim($row[22] ?? '') ?: null,
                'status' => $status,
                'progress' => $status->progress(),
            ]);

            $imported++;
        }

        fclose($handle);

        flashSuccess(__(':imported naskah berhasil diimport, :skipped dilewati.', [
            'imported' => $imported,
            'skipped' => $skipped,
        ]));

        return to_route('admin.naskah.index');
    }
}
