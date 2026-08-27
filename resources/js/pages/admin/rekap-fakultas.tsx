import { Head, Link } from '@inertiajs/react';
import {
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

type FacultyRow = {
    fakultas: string;
    total: number;
    sedang_proses: number;
    mundur: number;
    terbit: number;
};

type Filters = {
    from: string | null;
    to: string | null;
};

type Props = {
    overall: Omit<FacultyRow, 'fakultas'>;
    faculties: FacultyRow[];
    isbnStatuses: Array<{ value: string; label: string; count: number }>;
    filters: Filters;
};

const STATUS_COLORS = {
    proses: '#127ee3',
    terbit: '#10b981',
    mundur: '#f43f5e',
} as const;

const BAR_COLORS = {
    proses: STATUS_COLORS.proses,
    terbit: STATUS_COLORS.terbit,
    mundur: STATUS_COLORS.mundur,
} as const;

const ISBN_COLORS = {
    proses: '#f59e0b',
    terbit: '#10b981',
    revisi: '#8b5cf6',
} as const;

const ISBN_ICONS = {
    proses: Hourglass,
    terbit: BadgeCheck,
    revisi: RefreshCw,
} as const;

const naskahChartConfig = {
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

export default function RekapFakultas({
    overall,
    faculties,
    isbnStatuses,
    filters,
}: Props) {
    const naskahChartData = [
        {
            key: 'proses',
            value: overall.sedang_proses,
            fill: 'var(--color-proses)',
        },
        {
            key: 'terbit',
            value: overall.terbit,
            fill: 'var(--color-terbit)',
        },
        {
            key: 'mundur',
            value: overall.mundur,
            fill: 'var(--color-mundur)',
        },
    ];

    const naskahLegend = [
        {
            label: 'Total Pengajuan',
            value: overall.total,
            icon: BookOpenCheck,
            dot: 'var(--color-muted-foreground)',
        },
        {
            label: 'Sedang Diproses',
            value: overall.sedang_proses,
            icon: ListChecks,
            dot: STATUS_COLORS.proses,
        },
        {
            label: 'Terbit',
            value: overall.terbit,
            icon: BadgeCheck,
            dot: STATUS_COLORS.terbit,
        },
        {
            label: 'Penulis Mundur',
            value: overall.mundur,
            icon: UserMinus,
            dot: STATUS_COLORS.mundur,
        },
    ];

    const isbnTotal = isbnStatuses.reduce((acc, s) => acc + s.count, 0);

    const isbnChartData = isbnStatuses.map((status) => ({
        key: status.value,
        value: status.count,
        fill: `var(--color-${status.value})`,
    }));

    const isbnLegend = isbnStatuses.map((status) => ({
        label: status.label,
        value: status.count,
        dot: ISBN_COLORS[status.value as keyof typeof ISBN_COLORS] ?? '#94a3b8',
        icon:
            ISBN_ICONS[status.value as keyof typeof ISBN_ICONS] ?? Hourglass,
    }));

    const metrics: Array<{
        key: keyof Pick<
            FacultyRow,
            'total' | 'sedang_proses' | 'mundur' | 'terbit'
        >;
        label: string;
    }> = [
        { key: 'total', label: 'Total Pengajuan' },
        { key: 'sedang_proses', label: 'Sedang Diproses' },
        { key: 'terbit', label: 'Terbit' },
        { key: 'mundur', label: 'Penulis Mundur' },
    ];

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
            admin.rekapFakultas.export.url() + (qs ? `?${qs}` : '');
    }

    return (
        <>
            <Head title="Rekap Fakultas" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Rekap Fakultas</h1>
                        <p className="text-sm text-muted-foreground">
                            Distribusi naskah penerbitan per fakultas/sekolah.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportCsv}>
                        <Download className="size-4" />
                        Export
                    </Button>
                </div>

                <PeriodFilterCard
                    route={admin.rekapFakultas().url}
                    from={filters.from}
                    to={filters.to}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    <DonutStatCard
                        title="Statistik Naskah"
                        description="Distribusi seluruh naskah berdasarkan statusnya."
                        config={naskahChartConfig}
                        data={naskahChartData}
                        centerValue={overall.total}
                        centerLabel="Total Pengajuan"
                        legend={naskahLegend}
                    />
                    <DonutStatCard
                        title="ISBN per Status"
                        description="Distribusi data ISBN berdasarkan statusnya."
                        config={isbnChartConfig}
                        data={isbnChartData}
                        centerValue={isbnTotal}
                        centerLabel="Total ISBN"
                        legend={isbnLegend}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rekap per Fakultas</CardTitle>
                        <CardDescription>
                            Total pengajuan, naskah yang sedang diproses,
                            penulis mundur, dan ISBN yang sudah terbit untuk
                            setiap fakultas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                                        <th className="px-3 py-2 font-medium">
                                            Fakultas / Sekolah
                                        </th>
                                        {metrics.map((metric) => (
                                            <th
                                                key={metric.key}
                                                className="px-3 py-2 text-center font-medium"
                                            >
                                                {metric.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {faculties.map((row) => (
                                        <tr
                                            key={row.fakultas}
                                            className="border-b last:border-0 hover:bg-accent/50"
                                        >
                                            <td className="px-3 py-3">
                                                <Link
                                                    href={naskahIndex({
                                                        query: {
                                                            fakultas:
                                                                row.fakultas,
                                                        },
                                                    })}
                                                    title={`Lihat naskah ${row.fakultas}`}
                                                    className="block w-fit max-w-xs truncate font-medium hover:underline"
                                                >
                                                    {row.fakultas}
                                                </Link>
                                            </td>
                                            {metrics.map((metric) => (
                                                <td
                                                    key={metric.key}
                                                    className="px-3 py-3 text-center"
                                                >
                                                    <Badge
                                                        variant="secondary"
                                                        className="min-w-8 justify-center font-medium"
                                                    >
                                                        {row[metric.key]}
                                                    </Badge>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {faculties.length === 0 && (
                                        <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada data naskah.
                                        </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Klik nama fakultas untuk melihat daftar naskahnya.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total Pengajuan = Sedang Diproses + Terbit +
                            Penulis Mundur. Naskah yang ISBN-nya sudah pernah
                            terbit tetap dihitung sebagai Terbit meskipun
                            penulisnya kemudian mundur; kolom Penulis Mundur
                            hanya menghitung naskah yang mundur sebelum ISBN-nya
                            terbit.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="size-4 text-muted-foreground" />
                            Diagram Batang
                        </CardTitle>
                        <CardDescription>
                            Jumlah naskah tiap fakultas sebagai bagian dari{' '}
                            {overall.total} naskah keseluruhan. Satu bar penuh
                            berarti seluruh naskah berasal dari satu fakultas
                            (100%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {faculties.map((row) => {
                                const pctTotal = overall.total
                                    ? Math.round(
                                          (row.total / overall.total) * 100,
                                      )
                                    : 0;
                                const pctProses = overall.total
                                    ? (row.sedang_proses / overall.total) * 100
                                    : 0;
                                const pctTerbit = overall.total
                                    ? (row.terbit / overall.total) * 100
                                    : 0;
                                const pctMundur = overall.total
                                    ? (row.mundur / overall.total) * 100
                                    : 0;

                                return (
                                    <div
                                        key={row.fakultas}
                                        className="grid grid-cols-1 items-center gap-1 rounded-md px-1.5 py-1.5 transition-colors hover:bg-accent/50 sm:grid-cols-[220px_1fr_auto] sm:gap-3"
                                    >
                                        <div className="flex items-baseline justify-between gap-2 sm:block">
                                            <span
                                                title={row.fakultas}
                                                className="block min-w-0 truncate text-xs font-medium text-muted-foreground"
                                            >
                                                {row.fakultas}
                                            </span>
                                            <span className="text-xs font-semibold tabular-nums sm:hidden">
                                                {row.total} ({pctTotal}%)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                                                <div className="flex h-full gap-px">
                                                    <div
                                                        className="h-full transition-all duration-500"
                                                        style={{
                                                            width: `${pctProses}%`,
                                                            backgroundColor:
                                                                BAR_COLORS.proses,
                                                        }}
                                                    />
                                                    <div
                                                        className="h-full transition-all duration-500"
                                                        style={{
                                                            width: `${pctTerbit}%`,
                                                            backgroundColor:
                                                                BAR_COLORS.terbit,
                                                        }}
                                                    />
                                                    <div
                                                        className="h-full transition-all duration-500"
                                                        style={{
                                                            width: `${pctMundur}%`,
                                                            backgroundColor:
                                                                BAR_COLORS.mundur,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="hidden shrink-0 text-xs font-semibold tabular-nums sm:inline">
                                                {row.total} ({pctTotal}%)
                                            </span>
                                        </div>
                                        <Link
                                            href={naskahIndex({
                                                query: {
                                                    fakultas: row.fakultas,
                                                },
                                            })}
                                            title={`Lihat naskah ${row.fakultas}`}
                                            className="text-xs text-primary hover:underline sm:justify-self-end"
                                        >
                                            Lihat daftar
                                        </Link>
                                    </div>
                                );
                            })}
                            {faculties.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Belum ada data naskah.
                                </p>
                            )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{
                                        backgroundColor: BAR_COLORS.proses,
                                    }}
                                />
                                Sedang Diproses
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{
                                        backgroundColor: BAR_COLORS.terbit,
                                    }}
                                />
                                Terbit
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{
                                        backgroundColor: BAR_COLORS.mundur,
                                    }}
                                />
                                Penulis Mundur
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RekapFakultas.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
        {
            title: 'Rekap Fakultas',
            href: admin.rekapFakultas(),
        },
    ],
};
