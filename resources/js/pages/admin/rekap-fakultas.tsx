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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    aktif: 'bg-gradient-to-r from-emerald-500/60 to-emerald-500',
    mundur: 'bg-gradient-to-r from-rose-500/60 to-rose-500',
} as const;

const ISBN_ICONS = {
    proses: Hourglass,
    terbit: BadgeCheck,
    revisi: RefreshCw,
} as const;

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
    const summary = [
        {
            label: 'Total Keseluruhan',
            value: overall.total,
            icon: BookOpenCheck,
        },
        {
            label: 'Aktif',
            value: overall.aktif,
            icon: CircleCheck,
        },
        {
            label: 'Penulis Mundur',
            value: overall.mundur,
            icon: UserMinus,
        },
        {
            label: 'ISBN Terbit',
            value: overall.isbn_terbit,
            icon: BadgeCheck,
        },
    ];

    const metrics: Array<{
        key: keyof Pick<
            FacultyRow,
            'total' | 'aktif' | 'mundur' | 'isbn_terbit'
        >;
        label: string;
    }> = [
        { key: 'total', label: 'Total' },
        { key: 'aktif', label: 'Aktif' },
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

                <div className="grid gap-4 md:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.label}>
                            <CardContent className="flex items-center gap-4">
                                <item.icon className="size-8 text-muted-foreground" />
                                <div>
                                    {item.label === 'ISBN Terbit' ? (
                                        <SegmentedCount
                                            aktif={
                                                overall.isbn_terbit_aktif
                                            }
                                            mundur={
                                                overall.isbn_terbit_mundur
                                            }
                                            size="lg"
                                            title="Hijau = ISBN terbit pada naskah yang masih aktif; merah = ISBN terbit pada naskah yang kemudian penulis mundur."
                                        />
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {item.value}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {item.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BadgeCheck className="size-4 text-muted-foreground" />
                            ISBN per Status
                        </CardTitle>
                        <CardDescription>
                            Distribusi data ISBN berdasarkan status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {isbnStatuses.map((status) => {
                                const Icon =
                                    ISBN_ICONS[
                                        status.value as keyof typeof ISBN_ICONS
                                    ] ?? Hourglass;

                                return (
                                    <div
                                        key={status.value}
                                        className="flex items-center gap-4 rounded-md border p-3"
                                    >
                                        <Icon className="size-7 text-muted-foreground" />
                                        <div>
                                            <p className="text-xl font-bold">
                                                {status.count}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {status.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

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
                                                    className="w-fit max-w-xs truncate font-medium hover:underline"
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
                            Total = Aktif + Penulis Mundur. Badge ISBN Terbit
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
                                        className="grid grid-cols-1 items-center gap-1 rounded-md px-1.5 py-1.5 transition-colors hover:bg-accent/50 sm:grid-cols-[180px_1fr_auto] sm:gap-3"
                                    >
                                        <div className="flex items-baseline justify-between gap-2 sm:block">
                                            <span
                                                title={row.fakultas}
                                                className="truncate text-xs font-medium text-muted-foreground"
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
