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
        $statuses = collect(NaskahStatus::cases())->map(function (NaskahStatus $status) {
            return [
                'value' => $status->value,
                'label' => $status->label(),
                'progress' => $status->progress(),
                'count' => Naskah::where('status', $status->value)->count(),
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
                'admin' => $h->admin?->name,
                'waktu' => $h->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total' => Naskah::count(),
                'selesai' => Naskah::where('status', NaskahStatus::BukuDiambil->value)->count(),
                'sedang_proses' => Naskah::where('status', '!=', NaskahStatus::BukuDiambil->value)->count(),
            ],
            'statuses' => $statuses,
            'recentHistories' => $recentHistories,
        ]);
    }
}
