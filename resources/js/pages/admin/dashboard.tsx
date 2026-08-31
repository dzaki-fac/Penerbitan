import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    BadgeCheck,
    BookOpenCheck,
    Download,
    Hourglass,
    ListChecks,
    RefreshCw,
    UserMinus,
} from 'lucide-react';
import { DonutStatCard } from '@/components/donut-stat-card';
import { PeriodFilterCard } from '@/components/period-filter-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import admin from '@/routes/admin';
import { index as naskahIndex } from '@/routes/admin/naskah';

type Props = {
    stats: {
        total: number;
        terbit: number;
        sedang_proses: number;
        penulis_mundur: number;
    };
    statuses: Array<{
        value: string;
        label: string;
        stage: number;
        progress: number;
        count: number;
    }>;
    isbnStatuses: Array<{ value: string; label: string; count: number }>;
    recentHistories: Array<{
        id: number;
        naskah: string;
        dari_status: string | null;
        ke_status: string;
        aktor: string;
        admin: string | null;
        waktu: string;
    }>;
    filters: {
        from: string | null;
        to: string | null;
    };
};

const STATUS_COLORS = {
    proses: '#127ee3',
    terbit: '#10b981',
    mundur: '#f43f5e',
} as const;

const ISBN_COLORS = {
    proses: '#f59e0b',
    terbit: '#10b981',
    revisi: '#8b5cf6',
} as const;

const chartConfig = {
    naskah: {
        label: 'Naskah',
    },
    proses: {
        label: 'Sedang Diproses',
        color: STATUS_COLORS.proses,
    },
    terbit: {
        label: 'Terbit',
        color: STATUS_COLORS.terbit,
    },
    mundur: {
        label: 'Penulis Mundur',
        color: STATUS_COLORS.mundur,
    },
} satisfies ChartConfig;

const isbnChartConfig = {
    isbn: {
        label: 'ISBN',
    },
    proses: {
        label: 'Proses',
        color: ISBN_COLORS.proses,
    },
    terbit: {
        label: 'Terbit',
        color: ISBN_COLORS.terbit,
    },
    revisi: {
        label: 'Revisi',
        color: ISBN_COLORS.revisi,
    },
} satisfies ChartConfig;

export default function AdminDashboard({
    stats,
    statuses,
    isbnStatuses,
    recentHistories,
    filters,
}: Props) {
    const chartData = [
        {
            key: 'proses',
            value: stats.sedang_proses,
            fill: 'var(--color-proses)',
        },
        {
            key: 'terbit',
            value: stats.terbit,
            fill: 'var(--color-terbit)',
        },
        {
            key: 'mundur',
            value: stats.penulis_mundur,
            fill: 'var(--color-mundur)',
        },
    ];

    const summary = [
        {
            label: 'Total Pengajuan',
            value: stats.total,
            icon: BookOpenCheck,
            dot: 'var(--color-muted-foreground)',
        },
        {
            label: 'Sedang Diproses',
            value: stats.sedang_proses,
            icon: ListChecks,
            dot: STATUS_COLORS.proses,
        },
        {
            label: 'Terbit',
            value: stats.terbit,
            icon: BadgeCheck,
            dot: STATUS_COLORS.terbit,
        },
        {
            label: 'Penulis Mundur',
            value: stats.penulis_mundur,
            icon: UserMinus,
            dot: STATUS_COLORS.mundur,
        },
    ];

    const isbnIcons = {
        proses: Hourglass,
        terbit: BadgeCheck,
        revisi: RefreshCw,
    } as const;

    const totalNaskah = Math.max(stats.total, 1);

    const isbnTotal = isbnStatuses.reduce((acc, s) => acc + s.count, 0);

    const isbnChartData = isbnStatuses.map((status) => ({
        key: status.value,
        value: status.count,
        fill: `var(--color-${status.value})`,
    }));

    const isbnSummary = isbnStatuses.map((status) => ({
        label: status.label,
        value: status.count,
        dot: ISBN_COLORS[status.value as keyof typeof ISBN_COLORS] ?? '#94a3b8',
        icon:
            isbnIcons[status.value as keyof typeof isbnIcons] ?? Hourglass,
    }));

    function exportCsv() {
        const params = new URLSearchParams();

        if (filters.from) {
            params.set('from', filters.from);
        }

        if (filters.to) {
            params.set('to', filters.to);
        }

        const qs = params.toString();
        window.location.href =
            admin.dashboard.export.url() + (qs ? `?${qs}` : '');
    }

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan naskah dan ISBN penerbitan.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportCsv}>
                        <Download className="size-4" />
                        Export
                    </Button>
                </div>

                <PeriodFilterCard
                    route={admin.dashboard().url}
                    from={filters.from}
                    to={filters.to}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    <DonutStatCard
                        title="Statistik Naskah"
                        description="Distribusi seluruh naskah berdasarkan statusnya."
                        config={chartConfig}
                        data={chartData}
                        centerValue={stats.total}
                        centerLabel="Total Pengajuan"
                        legend={summary}
                    />
                    <DonutStatCard
                        title="ISBN per Status"
                        description="Distribusi data ISBN berdasarkan statusnya."
                        config={isbnChartConfig}
                        data={isbnChartData}
                        centerValue={isbnTotal}
                        centerLabel="Total ISBN"
                        legend={isbnSummary}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Naskah per Status</CardTitle>
                        <CardDescription>
                            Persentase naskah pada tiap status dari total{' '}
                            {stats.total} naskah. Bar penuh berarti seluruh
                            naskah berada pada status tersebut (100%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {statuses.map((status) => {
                                const pct = stats.total
                                    ? Math.round(
                                          (status.count / stats.total) * 100,
                                      )
                                    : 0;

                                return (
                                    <Link
                                        key={status.value}
                                        href={naskahIndex({
                                            query: { stage: status.stage },
                                        })}
                                        title={`${status.count} naskah (${pct}%) pada tahapan "${status.label}"`}
                                        className="group flex items-center gap-3 rounded-md px-1.5 py-1.5 transition-colors hover:bg-accent/50"
                                    >
                                        <span
                                            title={status.label}
                                            className="w-44 shrink-0 truncate text-xs font-medium text-muted-foreground group-hover:text-foreground"
                                        >
                                            {status.label}
                                        </span>
                                        <div className="h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                                            <div
                                                className="h-full rounded-sm bg-gradient-to-r from-primary/60 to-primary transition-all duration-500 group-hover:from-primary/80"
                                                style={{
                                                    width: status.count
                                                        ? `${Math.max((status.count / totalNaskah) * 100, 2)}%`
                                                        : '0%',
                                                }}
                                            />
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="w-14 shrink-0 justify-center tabular-nums"
                                        >
                                            {status.count} ({pct}%)
                                        </Badge>
                                    </Link>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Klik salah satu baris untuk melihat daftar naskah
                            pada status tersebut.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="size-4 text-muted-foreground" />
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription>
                            10 perubahan status terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {recentHistories.map((history) => (
                                <li
                                    key={history.id}
                                    className="flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm"
                                >
                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {history.naskah}
                                    </span>
                                    {history.dari_status && (
                                        <span className="text-xs text-muted-foreground">
                                            {history.dari_status} →{' '}
                                            {history.ke_status}
                                        </span>
                                    )}
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
                                        {history.aktor}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {history.waktu}
                                    </span>
                                </li>
                            ))}
                            {recentHistories.length === 0 && (
                                <li className="text-sm text-muted-foreground">
                                    Belum ada aktivitas.
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
    ],
};
