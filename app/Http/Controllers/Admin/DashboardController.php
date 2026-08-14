<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NaskahStatus;
use App\Http\Controllers\Controller;
use App\Models\Naskah;
use App\Models\WorkflowHistory;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard admin.
     */
    public function index(): Response
    {
        $statuses = collect(NaskahStatus::ordered())->map(function (NaskahStatus $status) {
            $memberStatuses = array_map(
                fn (NaskahStatus $s) => $s->value,
                NaskahStatus::forStage($status->stage()),
            );

            return [
                'value' => $status->value,
                'label' => $status->label(),
                'stage' => $status->stage(),
                'progress' => $status->progress(),
                'count' => Naskah::whereIn('status', $memberStatuses)->count(),
            ];
        });

        $recentHistories = WorkflowHistory::query()
            ->with('naskah.author', 'admin')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (WorkflowHistory $h) => [
                'id' => $h->id,
                'naskah' => $h->naskah?->judul,
                'dari_status' => $h->dari_status?->label(),
                'ke_status' => $h->ke_status->label(),
                'aktor' => $h->aktor->label(),
                'admin' => $h->admin?->name ? initialsOf($h->admin->name) : null,
                'waktu' => $h->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total' => Naskah::count(),
                'selesai' => Naskah::where('status', NaskahStatus::Selesai->value)->count(),
                'sedang_proses' => Naskah::where('status', '!=', NaskahStatus::Selesai->value)->count(),
            ],
            'statuses' => $statuses,
            'recentHistories' => $recentHistories,
        ]);
    }
}
