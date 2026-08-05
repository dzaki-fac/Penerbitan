<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AktorType;
use App\Enums\DokumenStatus;
use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NaskahStoreRequest;
use App\Http\Requests\Admin\NaskahUpdateRequest;
use App\Models\Author;
use App\Models\Dokumen;
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

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $naskahs = $query
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Naskah $naskah) => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'kategori' => $naskah->kategori,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
                'penulis' => $naskah->author->nama,
                'identitas' => $naskah->author->jenis_identitas->label().' '.$naskah->author->nomor_identitas,
            ]);

        return Inertia::render('admin/naskah/index', [
            'naskahs' => $naskahs,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', ''),
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
     * Menyimpan naskah baru beserta penulis dan dokumen awal.
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
            ],
        );

        $naskah = Naskah::create([
            'author_id' => $author->id,
            'judul' => $data['judul'],
            'abstrak' => $data['abstrak'] ?? null,
            'kategori' => $data['kategori'] ?? null,
            'tanggal_pengajuan' => $data['tanggal_pengajuan'],
            'sumber_form' => $data['sumber_form'] ?? null,
            'status' => NaskahStatus::DataDiterima,
            'progress' => NaskahStatus::DataDiterima->progress(),
        ]);

        $namaDokumen = $data['dokumen'] ?? ['Naskah Utuh', 'Abstrak', 'Pernyataan Orisinalitas'];

        foreach ($namaDokumen as $nama) {
            Dokumen::create([
                'naskah_id' => $naskah->id,
                'nama_dokumen' => $nama,
                'status' => DokumenStatus::Belum,
            ]);
        }

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
                'abstrak' => $naskah->abstrak,
                'kategori' => $naskah->kategori,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('Y-m-d'),
                'sumber_form' => $naskah->sumber_form,
                'penulis' => [
                    'nama' => $naskah->author->nama,
                    'email' => $naskah->author->email,
                    'jenis_identitas' => $naskah->author->jenis_identitas->label(),
                    'nomor_identitas' => $naskah->author->nomor_identitas,
                ],
            ],
        ]);
    }

    /**
     * Memperbarui data naskah.
     */
    public function update(Naskah $naskah, NaskahUpdateRequest $request): RedirectResponse
    {
        $naskah->update($request->validated());

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
            'dokumens',
            'layouts',
            'isbn',
            'revisiUploads',
            'histories.admin',
        ]);

        return Inertia::render('admin/naskah/show', [
            'naskah' => [
                'id' => $naskah->id,
                'judul' => $naskah->judul,
                'abstrak' => $naskah->abstrak,
                'kategori' => $naskah->kategori,
                'status' => ['value' => $naskah->status->value, 'label' => $naskah->status->label()],
                'progress' => $naskah->progress,
                'tanggal_pengajuan' => $naskah->tanggal_pengajuan->format('d M Y'),
                'sumber_form' => $naskah->sumber_form,
                'catatan_admin' => $naskah->catatan_admin,
                'author' => [
                    'id' => $naskah->author->id,
                    'nama' => $naskah->author->nama,
                    'email' => $naskah->author->email,
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
            'adminTransitions' => WorkflowService::adminTransitionsFor($naskah->status->value),
            'statusOptions' => collect(NaskahStatus::cases())->map(fn (NaskahStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Menghapus naskah.
     */
    public function destroy(Naskah $naskah): RedirectResponse
    {
        $naskah->delete();

        flashSuccess(__('Naskah berhasil dihapus.'));

        return to_route('admin.naskah.index');
    }
}
