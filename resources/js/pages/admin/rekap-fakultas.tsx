import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpenCheck,
    CircleCheck,
    Download,
    Hourglass,
    ListChecks,
    RefreshCw,
    UserMinus,
} from 'lucide-react';
import { DonutStatCard } from '@/components/donut-stat-card';
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
import { DateRangePicker, dateToQueryString, queryStringToDate } from '@/components/ui/date-range-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { index as naskahIndex } from '@/routes/admin/naskah';

type FacultyRow = {
    fakultas: string;
    total: number;
    aktif: number;
    mundur: number;
    sedang_proses: number;
    selesai: number;
    isbn_terbit: number;
    isbn_terbit_aktif: number;
    isbn_terbit_mundur: number;
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

const BAR_COLORS = {
    aktif: 'bg-emerald-500',
    mundur: 'bg-rose-500',
} as const;

const STATUS_COLORS = {
    proses: '#127ee3',
    selesai: '#10b981',
    mundur: '#f43f5e',
} as const;

const ISBN_COLORS = {
    proses: '#f59e0b',
    terbit: '#10b981',
    revisi: '#8b5cf6',
    terbit_mundur: '#f43f5e',
} as const;

const ISBN_ICONS = {
    proses: Hourglass,
    terbit: BadgeCheck,
    revisi: RefreshCw,
    terbit_mundur: UserMinus,
} as const;

const naskahChartConfig = {
    naskah: {
        label: 'Naskah',
    },
    proses: {
        label: 'Sedang Diproses',
        color: STATUS_COLORS.proses,
    },
    selesai: {
        label: 'Selesai',
        color: STATUS_COLORS.selesai,
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
    terbit_mundur: {
        label: 'Terbit (Penulis Mundur)',
        color: ISBN_COLORS.terbit_mundur,
    },
} satisfies ChartConfig;

const PERIOD_OPTIONS = [
    { key: 'all', label: 'Semua Data' },
    { key: 'today', label: 'Hari Ini', days: 0 },
    { key: '7d', label: '7 Hari Terakhir', days: 6 },
    { key: '30d', label: '30 Hari Terakhir', days: 29 },
    { key: '1y', label: '1 Tahun Terakhir', days: 364 },
    { key: 'custom', label: 'Custom Range' },
] as const;

function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function prettyDate(value: string | null): string {
    if (!value) {
        return '…';
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function SegmentedCount({
    aktif,
    mundur,
    title,
    size = 'sm',
}: {
    aktif: number;
    mundur: number;
    title: string;
    size?: 'sm' | 'lg';
}) {
    if (aktif + mundur === 0) {
        return <Badge variant="secondary">0</Badge>;
    }

    const segment =
        size === 'lg'
            ? 'px-3 py-1 text-2xl'
            : 'px-1.5 py-0.5 text-xs';

    return (
        <span
            title={title}
            className="inline-flex items-stretch overflow-hidden rounded-md border font-semibold tabular-nums"
        >
            {aktif > 0 && (
                <span
                    className={`bg-emerald-500 ${segment} text-white`}
                >
                    {aktif}
                </span>
            )}
            {mundur > 0 && (
                <span className={`bg-rose-500 ${segment} text-white`}>
                    {mundur}
                </span>
            )}
        </span>
    );
}

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
            key: 'selesai',
            value: overall.selesai,
            fill: 'var(--color-selesai)',
        },
        {
            key: 'mundur',
            value: overall.mundur,
            fill: 'var(--color-mundur)',
        },
    ];

    const naskahLegend = [
        {
            label: 'Total Naskah',
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
            label: 'Selesai',
            value: overall.selesai,
            icon: CircleCheck,
            dot: STATUS_COLORS.selesai,
        },
        {
            label: 'Penulis Mundur',
            value: overall.mundur,
            icon: UserMinus,
            dot: STATUS_COLORS.mundur,
        },
    ];

    const terbitMundur =
        isbnStatuses.find((status) => status.value === 'terbit_mundur')
            ?.count ?? 0;

    const isbnTotal = isbnStatuses
        .filter((status) => status.value !== 'terbit_mundur')
        .reduce((acc, s) => acc + s.count, 0);

    const isbnChartData = [
        ...isbnStatuses
            .filter((status) => status.value !== 'terbit_mundur')
            .map((status) => ({
                key: status.value,
                value:
                    status.value === 'terbit'
                        ? Math.max(status.count - terbitMundur, 0)
                        : status.count,
                fill: `var(--color-${status.value})`,
            })),
        {
            key: 'terbit_mundur',
            value: terbitMundur,
            fill: 'var(--color-terbit_mundur)',
        },
    ];

    const isbnLegend = isbnStatuses.map((status) => ({
        label: status.label,
        value:
            status.value === 'terbit'
                ? Math.max(status.count - terbitMundur, 0)
                : status.count,
        dot: ISBN_COLORS[status.value as keyof typeof ISBN_COLORS] ?? '#94a3b8',
        icon:
            ISBN_ICONS[status.value as keyof typeof ISBN_ICONS] ?? Hourglass,
    }));

    const metrics: Array<{
        key: keyof Pick<
            FacultyRow,
            | 'total'
            | 'sedang_proses'
            | 'selesai'
            | 'mundur'
            | 'isbn_terbit'
        >;
        label: string;
    }> = [
        { key: 'total', label: 'Total' },
        { key: 'sedang_proses', label: 'Sedang Diproses' },
        { key: 'selesai', label: 'Selesai' },
        { key: 'mundur', label: 'Penulis Mundur' },
        { key: 'isbn_terbit', label: 'ISBN Terbit' },
    ];

    function go(from: string | null, to: string | null) {
        const params: Record<string, string> = {};

        if (from) {
            params.from = from;
        }

        if (to) {
            params.to = to;
        }

        router.get(admin.rekapFakultas(), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function applyPeriod(key: string) {
        if (key === 'all') {
            go(null, null);

            return;
        }

        if (key === 'custom') {
            return;
        }

        const preset = PERIOD_OPTIONS.find((option) => option.key === key);

        if (!preset || !('days' in preset)) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const from = new Date(today);
        from.setDate(from.getDate() - preset.days);

        go(toDateString(from), toDateString(today));
    }

    const activePeriodKey = (() => {
        const { from, to } = filters;

        if (!from && !to) {
            return 'all';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toDateString(today);

        for (const preset of PERIOD_OPTIONS) {
            if (!('days' in preset)) {
                continue;
            }

            const fromDate = new Date(today);

            fromDate.setDate(fromDate.getDate() - preset.days);

            if (from === toDateString(fromDate) && to === todayStr) {
                return preset.key;
            }
        }

        return 'custom';
    })();

    const periodText =
        filters.from || filters.to
            ? `Periode: ${prettyDate(filters.from)} – ${prettyDate(filters.to)}`
            : 'Periode: Semua data';

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

                <Card className="py-4">
                    <CardContent className="flex flex-wrap items-center gap-3 px-4">
                        <Select
                            value={activePeriodKey}
                            onValueChange={applyPeriod}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Pilih periode" />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIOD_OPTIONS.map((option) => (
                                    <SelectItem key={option.key} value={option.key}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DateRangePicker
                            key={`${filters.from ?? ''}-${filters.to ?? ''}`}
                            value={{
                                start: queryStringToDate(filters.from ?? ''),
                                end: queryStringToDate(filters.to ?? ''),
                            }}
                            onChange={(range) =>
                                go(
                                    range.start
                                        ? dateToQueryString(range.start)
                                        : null,
                                    range.end
                                        ? dateToQueryString(range.end)
                                        : null,
                                )
                            }
                        />
                        <p className="ml-auto text-sm text-muted-foreground">
                            {periodText}
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <DonutStatCard
                        title="Statistik Naskah"
                        description="Distribusi seluruh naskah berdasarkan statusnya."
                        config={naskahChartConfig}
                        data={naskahChartData}
                        centerValue={overall.total}
                        centerLabel="Total Naskah"
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
                            Total naskah, status aktif/penulis mundur, dan ISBN
                            yang sudah terbit untuk setiap fakultas.
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
                                                    {metric.key ===
                                                    'isbn_terbit' ? (
                                                        <SegmentedCount
                                                            aktif={
                                                                row.isbn_terbit_aktif
                                                            }
                                                            mundur={
                                                                row.isbn_terbit_mundur
                                                            }
                                                            title={`ISBN terbit pada naskah aktif: ${row.isbn_terbit_aktif}; pada naskah yang kemudian mundur: ${row.isbn_terbit_mundur}.`}
                                                        />
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="min-w-8 justify-center font-medium"
                                                        >
                                                            {row[metric.key]}
                                                        </Badge>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {faculties.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
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
                            Sedang Diproses + Selesai + Penulis Mundur = Total.
                            Badge ISBN Terbit
                            dipecah jadi{' '}
                            <span className="inline-flex h-3.5 items-center rounded-sm bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                                hijau
                            </span>{' '}
                            = terbit pada naskah yang masih aktif dan{' '}
                            <span className="inline-flex h-3.5 items-center rounded-sm bg-rose-500 px-1 text-[10px] font-semibold text-white">
                                merah
                            </span>{' '}
                            = terbit pada naskah yang kemudian penulis mundur;
                            bisa merujuk naskah yang sama, tidak ditambahkan ke
                            Total.
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
                                const pctAktif = overall.total
                                    ? (row.aktif / overall.total) * 100
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
                                                        className={cn(
                                                            'h-full transition-all duration-500',
                                                            BAR_COLORS.aktif,
                                                        )}
                                                        style={{
                                                            width: `${pctAktif}%`,
                                                        }}
                                                    />
                                                    <div
                                                        className={cn(
                                                            'h-full transition-all duration-500',
                                                            BAR_COLORS.mundur,
                                                        )}
                                                        style={{
                                                            width: `${pctMundur}%`,
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
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-sm',
                                        BAR_COLORS.aktif,
                                    )}
                                />
                                Aktif
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-sm',
                                        BAR_COLORS.mundur,
                                    )}
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
