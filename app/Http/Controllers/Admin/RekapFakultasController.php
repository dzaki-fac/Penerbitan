<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RekapFakultasController extends Controller
{
    /**
     * Menampilkan rekap naskah per fakultas.
     */
    public function index(): Response
    {
        $rows = DB::table('naskahs')
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
            )
            ->select(
                'authors.fakultas_sekolah',
                DB::raw('COUNT(naskahs.id) as total'),
                DB::raw("COUNT(CASE WHEN naskahs.status <> '".NaskahStatus::PenulisMundur->value."' THEN 1 END) as diterima"),
                DB::raw("COUNT(CASE WHEN naskahs.status = '".NaskahStatus::PenulisMundur->value."' THEN 1 END) as ditolak"),
                DB::raw("COUNT(CASE WHEN naskahs.status = '".NaskahStatus::Selesai->value."' AND terbit_histories.naskah_id IS NOT NULL THEN 1 END) as isbn_terbit"),
            )
            ->groupBy('authors.fakultas_sekolah')
            ->orderByDesc('total')
            ->get();

        $mapped = $rows->map(fn ($row) => [
            'fakultas' => $row->fakultas_sekolah ?? 'Belum terisi',
            'total' => (int) $row->total,
            'diterima' => (int) $row->diterima,
            'ditolak' => (int) $row->ditolak,
            'isbn_terbit' => (int) $row->isbn_terbit,
        ]);

        $overall = $this->summarize($rows);

        return Inertia::render('admin/rekap-fakultas', [
            'overall' => $overall,
            'faculties' => $mapped->filter(fn ($row) => $row['total'] > 0)->values(),
        ]);
    }

    /**
     * @param  Collection<int, \stdClass>  $rows
     * @return array{total: int, diterima: int, ditolak: int, isbn_terbit: int}
     */
    private function summarize(Collection $rows): array
    {
        return [
            'total' => (int) $rows->sum('total'),
            'diterima' => (int) $rows->sum('diterima'),
            'ditolak' => (int) $rows->sum('ditolak'),
            'isbn_terbit' => (int) $rows->sum('isbn_terbit'),
        ];
    }
}
