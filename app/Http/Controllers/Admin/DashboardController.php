<?php

namespace App\Http\Controllers\Admin;

use App\Enums\IsbnStatus;
use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Models\Isbn;
use App\Models\Naskah;
use App\Models\WorkflowHistory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard admin.
     */
    public function index(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);

        $statuses = collect(NaskahStatus::ordered())->map(function (NaskahStatus $status) use ($from, $to) {
            $memberStatuses = array_map(
                fn (NaskahStatus $s) => $s->value,
                NaskahStatus::forStage($status->stage()),
            );

            return [
                'value' => $status->value,
                'label' => $status->label(),
                'stage' => $status->stage(),
                'progress' => $status->progress(),
                'count' => $this->naskahQuery($from, $to)
                    ->whereIn('status', $memberStatuses)
                    ->count(),
            ];
        });

        $recentHistories = WorkflowHistory::query()
            ->with('naskah.author', 'admin')
            ->when($from, fn ($query) => $query->whereHas('naskah', fn ($naskah) => $naskah
                ->where('tanggal_pengajuan', '>=', $from)))
            ->when($to, fn ($query) => $query->whereHas('naskah', fn ($naskah) => $naskah
                ->where('tanggal_pengajuan', '<=', $to)))
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (WorkflowHistory $h) => [
                'id' => $h->id,
                'naskah' => $h->naskah?->judul,
                'dari_status' => $h->dari_status?->label(),
                'ke_status' => $h->ke_status->label(),
                'aktor' => $h->aktor->label(),
                'admin' => $h->admin?->nickname ?? $h->admin?->nama_lengkap,
                'waktu' => $h->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $this->stats($from, $to),
            'statuses' => $statuses,
            'isbnStatuses' => $this->isbnRows($from, $to),
            'recentHistories' => $recentHistories,
            'filters' => [
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
        ]);
    }

    /**
     * Export ringkasan dashboard ke CSV (mengikuti filter from/to aktif).
     */
    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->dateRange($request);
        $stats = $this->stats($from, $to);
        $periode = $this->periodeLabel($from, $to);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment;filename="dashboard_'.now()->format('Ymd_His').'.csv"',
        ];

        return response()->streamDownload(function () use ($from, $to, $stats, $periode) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Periode', $periode]);
            fputcsv($handle, ['Kategori', 'Status', 'Jumlah']);

            foreach ($this->statusRows($from, $to) as $row) {
                fputcsv($handle, ['Naskah', $row['label'], $row['count']]);
            }

            fputcsv($handle, ['Naskah', 'TOTAL', $stats['total']]);

            foreach ($this->isbnRows($from, $to) as $row) {
                fputcsv($handle, ['ISBN', $row['label'], $row['count']]);
            }

            fclose($handle);
        }, 'dashboard.csv', $headers);
    }

    /**
     * @return array{total: int, terbit: int, penulis_mundur: int, sedang_proses: int}
     */
    private function stats(?Carbon $from, ?Carbon $to): array
    {
        $query = $this->naskahQuery($from, $to);

        $terbitQuery = (clone $query)->whereHas('histories', fn ($history) => $history
            ->where('ke_status', NaskahStatus::IsbnTerbit->value));

        return [
            'total' => (clone $query)->count(),
            'terbit' => $terbitQuery->count(),
            'penulis_mundur' => (clone $query)
                ->where('status', NaskahStatus::PenulisMundur->value)
                ->whereDoesntHave('histories', fn ($history) => $history
                    ->where('ke_status', NaskahStatus::IsbnTerbit->value))
                ->count(),
            'sedang_proses' => (clone $query)
                ->where('status', '<>', NaskahStatus::PenulisMundur->value)
                ->whereDoesntHave('histories', fn ($history) => $history
                    ->where('ke_status', NaskahStatus::IsbnTerbit->value))
                ->count(),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string, stage: int, progress: int, count: int}>
     */
    private function statusRows(?Carbon $from, ?Carbon $to): array
    {
        return collect(NaskahStatus::ordered())
            ->map(function (NaskahStatus $status) use ($from, $to) {
                $memberStatuses = array_map(
                    fn (NaskahStatus $s) => $s->value,
                    NaskahStatus::forStage($status->stage()),
                );

                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                    'stage' => $status->stage(),
                    'progress' => $status->progress(),
                    'count' => $this->naskahQuery($from, $to)
                        ->whereIn('status', $memberStatuses)
                        ->count(),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string, count: int}>
     */
    private function isbnRows(?Carbon $from, ?Carbon $to): array
    {
        return collect(IsbnStatus::cases())
            ->map(fn (IsbnStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
                'count' => $this->isbnQuery($status->value, $from, $to)->count(),
            ])
            ->all();
    }

    private function naskahQuery(?Carbon $from, ?Carbon $to): Builder
    {
        return Naskah::query()
            ->when($from, fn ($query) => $query->where('tanggal_pengajuan', '>=', $from->copy()->startOfDay()))
            ->when($to, fn ($query) => $query->where('tanggal_pengajuan', '<=', $to->copy()->endOfDay()));
    }

    private function isbnQuery(string $status, ?Carbon $from, ?Carbon $to): Builder
    {
        return Isbn::query()
            ->where('status', $status)
            ->when($from, fn ($query) => $query->whereHas('naskah', fn ($naskah) => $naskah
                ->where('tanggal_pengajuan', '>=', $from->copy()->startOfDay())))
            ->when($to, fn ($query) => $query->whereHas('naskah', fn ($naskah) => $naskah
                ->where('tanggal_pengajuan', '<=', $to->copy()->endOfDay())));
    }

    /**
     * Label rentang waktu untuk baris pertama file export.
     */
    private function periodeLabel(?Carbon $from, ?Carbon $to): string
    {
        if (! $from && ! $to) {
            return 'Semua Data';
        }

        return sprintf(
            '%s – %s',
            $from?->translatedFormat('d M Y') ?? '…',
            $to?->translatedFormat('d M Y') ?? '…',
        );
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function dateRange(Request $request): array
    {
        return [
            $this->parseDate($request->query('from')),
            $this->parseDate($request->query('to')),
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
