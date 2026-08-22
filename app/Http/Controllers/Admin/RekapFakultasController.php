<?php

namespace App\Http\Controllers\Admin;

use App\Enums\IsbnStatus;
use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Models\Isbn;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RekapFakultasController extends Controller
{
    /**
     * Menampilkan rekap naskah per fakultas.
     */
    public function index(Request $request): Response
    {
        $from = $this->parseDate($request->query('from'));
        $to = $this->parseDate($request->query('to'));

        $rows = $this->fetchRows($from, $to);

        $mapped = $rows->map(fn ($row) => [
            'fakultas' => $row->fakultas_sekolah ?? 'Belum terisi',
            'total' => (int) $row->total,
            'sedang_proses' => (int) $row->sedang_proses,
            'mundur' => (int) $row->mundur,
            'terbit' => (int) $row->terbit,
        ]);

        $overall = $this->summarize($rows);

        $isbnStatuses = collect(IsbnStatus::cases())->map(function (IsbnStatus $status) use ($from, $to) {
            $query = Isbn::query()->where('status', $status->value);

            if ($from) {
                $query->whereHas('naskah', fn ($naskah) => $naskah
                    ->where('tanggal_pengajuan', '>=', $from));
            }

            if ($to) {
                $query->whereHas('naskah', fn ($naskah) => $naskah
                    ->where('tanggal_pengajuan', '<=', $to));
            }

            return [
                'value' => $status->value,
                'label' => $status->label(),
                'count' => $query->count(),
            ];
        });

        return Inertia::render('admin/rekap-fakultas', [
            'overall' => $overall,
            'faculties' => $mapped->filter(fn ($row) => $row['total'] > 0)->values(),
            'isbnStatuses' => $isbnStatuses,
            'filters' => [
                'from' => $from?->toDateString() ?? null,
                'to' => $to?->toDateString() ?? null,
            ],
        ]);
    }

    /**
     * Export rekap fakultas ke CSV (mengikuti filter from/to aktif).
     */
    public function export(Request $request): StreamedResponse
    {
        $from = $this->parseDate($request->query('from'));
        $to = $this->parseDate($request->query('to'));

        $rows = $this->fetchRows($from, $to);
        $overall = $this->summarize($rows);
        $periode = ! $from && ! $to
            ? 'Semua Data'
            : sprintf(
                '%s – %s',
                $from?->translatedFormat('d M Y') ?? '…',
                $to?->translatedFormat('d M Y') ?? '…',
            );

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment;filename="rekap_fakultas_'.now()->format('Ymd_His').'.csv"',
        ];

        return response()->streamDownload(function () use ($rows, $overall, $periode) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Periode', $periode]);

            fputcsv($handle, [
                'Fakultas/Sekolah', 'Total Pengajuan', 'Sedang Diproses',
                'Penulis Mundur', 'Terbit',
            ]);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->fakultas_sekolah ?? 'Belum terisi',
                    (int) $row->total,
                    (int) $row->sedang_proses,
                    (int) $row->mundur,
                    (int) $row->terbit,
                ]);
            }

            fputcsv($handle, [
                'TOTAL',
                $overall['total'],
                $overall['sedang_proses'],
                $overall['mundur'],
                $overall['terbit'],
            ]);

            fclose($handle);
        }, 'rekap_fakultas.csv', $headers);
    }

    /**
     * Menjalankan query rekap per fakultas dengan filter tanggal.
     *
     * @return Collection<int, object>
     */
    private function fetchRows(?Carbon $from, ?Carbon $to): Collection
    {
        $query = DB::table('naskahs')
            ->leftJoin('authors', 'authors.id', '=', 'naskahs.author_id')
            ->leftJoinSub(
                DB::table('workflow_histories')
                    ->select('naskah_id')
                    ->where('ke_status', NaskahStatus::IsbnTerbit->value)
                    ->distinct(),
                'terbit_histories',
                'terbit_histories.naskah_id',
                '=',
                'naskahs.id',
            );

        if ($from) {
            $query->where('naskahs.tanggal_pengajuan', '>=', $from->startOfDay());
        }

        if ($to) {
            $query->where('naskahs.tanggal_pengajuan', '<=', $to->endOfDay());
        }

        return $query
            ->select(
                'authors.fakultas_sekolah',
                DB::raw('COUNT(naskahs.id) as total'),
                DB::raw('COUNT(CASE WHEN terbit_histories.naskah_id IS NOT NULL THEN 1 END) as terbit'),
                DB::raw("COUNT(CASE WHEN naskahs.status = '".NaskahStatus::PenulisMundur->value."' AND terbit_histories.naskah_id IS NULL THEN 1 END) as mundur"),
                DB::raw("COUNT(CASE WHEN naskahs.status <> '".NaskahStatus::PenulisMundur->value."' AND terbit_histories.naskah_id IS NULL THEN 1 END) as sedang_proses"),
            )
            ->groupBy('authors.fakultas_sekolah')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * @return array{total: int, sedang_proses: int, mundur: int, terbit: int}
     */
    private function summarize(Collection $rows): array
    {
        return [
            'total' => (int) $rows->sum('total'),
            'sedang_proses' => (int) $rows->sum('sedang_proses'),
            'mundur' => (int) $rows->sum('mundur'),
            'terbit' => (int) $rows->sum('terbit'),
        ];
    }

    /**
     * Memvalidasi tanggal format Y-m-d; mengembalikan null jika tidak valid.
     */
    private function parseDate(mixed $value): ?Carbon
    {
        if (! is_string($value)) {
            return null;
        }

        try {
            $date = Carbon::createFromFormat('Y-m-d', $value);
        } catch (\Throwable) {
            return null;
        }

        return $date && $date->format('Y-m-d') === $value ? $date : null;
    }
}
