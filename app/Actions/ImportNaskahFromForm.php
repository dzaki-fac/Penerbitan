<?php

namespace App\Actions;

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
use App\Models\Author;
use App\Models\Naskah;
use App\Services\WorkflowService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ImportNaskahFromForm
{
    /**
     * Mengimpor satu pengajuan naskah dari webhook Google Form.
     *
     * Penulis dicari/dibuat berdasarkan jenis + nomor identitas (NIM/NIP),
     * lalu naskah dibuat dengan status awal DataDiterima. Jika kombinasi
     * penulis + judul + tanggal pengajuan (lengkap dengan jam:menit:detik)
     * sudah ada, webhook tidak menduplikasi data (aman dari retry trigger
     * Google Apps Script).
     *
     * @param  array<string, mixed>  $data
     * @return array{status: string, naskah_id?: int}
     */
    public function run(array $data): array
    {
        $author = Author::firstOrCreate(
            [
                'jenis_identitas' => $data['jenis_identitas'],
                'nomor_identitas' => $data['nomor_identitas'],
            ],
            [
                'nama' => $data['nama'],
                'email' => $data['email'] ?? null,
                'status' => $data['status'] ?? null,
                'fakultas_sekolah' => $data['fakultas_sekolah'] ?? null,
                'nomor_npwp' => $data['nomor_npwp'] ?? null,
                'nomor_whatsapp' => $data['nomor_whatsapp'] ?? null,
                'penulis_tambahan' => $data['penulis_tambahan'] ?? null,
            ],
        );

        $exists = $author->naskahs()
            ->where('judul', $data['judul'])
            ->where('tanggal_pengajuan', Carbon::parse($data['tanggal_pengajuan'])->format('Y-m-d H:i:s'))
            ->exists();

        if ($exists) {
            return ['status' => 'already_exists'];
        }

        $naskah = DB::transaction(function () use ($author, $data): Naskah {
            $naskah = Naskah::create([
                'author_id' => $author->id,
                'judul' => $data['judul'],
                'link_cover' => $data['link_cover'] ?? null,
                'tanggal_pengajuan' => $data['tanggal_pengajuan'],
                'sumber_form' => $data['form'] ?? null,
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

            return $naskah;
        });

        return ['status' => 'created', 'naskah_id' => $naskah->id];
    }
}
