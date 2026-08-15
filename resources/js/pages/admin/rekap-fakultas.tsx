import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpenCheck,
    CircleCheck,
    ListChecks,
    UserMinus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { index as naskahIndex } from '@/routes/admin/naskah';

type FacultyRow = {
    fakultas: string;
    total: number;
    diterima: number;
    ditolak: number;
    isbn_terbit: number;
};

type Props = {
    overall: Omit<FacultyRow, 'fakultas'>;
    faculties: FacultyRow[];
};

const BAR_COLORS = {
    diterima: 'bg-gradient-to-r from-emerald-500/60 to-emerald-500',
    ditolak: 'bg-gradient-to-r from-rose-500/60 to-rose-500',
} as const;

export default function RekapFakultas({ overall, faculties }: Props) {
    const summary = [
        {
            label: 'Total Keseluruhan',
            value: overall.total,
            icon: BookOpenCheck,
        },
        {
            label: 'Diterima',
            value: overall.diterima,
            icon: CircleCheck,
        },
        {
            label: 'Penulis Mundur',
            value: overall.ditolak,
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
            'total' | 'diterima' | 'ditolak' | 'isbn_terbit'
        >;
        label: string;
    }> = [
        { key: 'total', label: 'Total' },
        { key: 'diterima', label: 'Diterima' },
        { key: 'ditolak', label: 'Penulis Mundur' },
        { key: 'isbn_terbit', label: 'ISBN Terbit' },
    ];

    return (
        <>
            <Head title="Rekap Fakultas" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div>
                    <h1 className="text-lg font-semibold">Rekap Fakultas</h1>
                    <p className="text-sm text-muted-foreground">
                        Distribusi naskah penerbitan per fakultas/sekolah.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.label}>
                            <CardContent className="flex items-center gap-4">
                                <item.icon className="size-8 text-muted-foreground" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {item.value}
                                    </p>
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
                        <CardTitle>Rekap per Fakultas</CardTitle>
                        <CardDescription>
                            Total naskah, status diterima/penulis mundur, dan
                            ISBN yang sudah terbit untuk setiap fakultas.
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
                                                <div className="flex flex-col gap-1.5">
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
                                                    <div className="flex h-2.5 w-full max-w-md min-w-40 gap-1">
                                                        <div
                                                            className={cn(
                                                                'h-full rounded-sm transition-all',
                                                                BAR_COLORS.diterima,
                                                            )}
                                                            style={{
                                                                width: `${(row.diterima / Math.max(overall.total, 1)) * 100}%`,
                                                            }}
                                                        />
                                                        <div
                                                            className={cn(
                                                                'h-full rounded-sm transition-all',
                                                                BAR_COLORS.ditolak,
                                                            )}
                                                            style={{
                                                                width: `${(row.ditolak / Math.max(overall.total, 1)) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
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
                                const pctDiterima = overall.total
                                    ? (row.diterima / overall.total) * 100
                                    : 0;
                                const pctDitolak = overall.total
                                    ? (row.ditolak / overall.total) * 100
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
                                                            BAR_COLORS.diterima,
                                                        )}
                                                        style={{
                                                            width: `${pctDiterima}%`,
                                                        }}
                                                    />
                                                    <div
                                                        className={cn(
                                                            'h-full transition-all duration-500',
                                                            BAR_COLORS.ditolak,
                                                        )}
                                                        style={{
                                                            width: `${pctDitolak}%`,
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
                                        BAR_COLORS.diterima,
                                    )}
                                />
                                Diterima
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-sm',
                                        BAR_COLORS.ditolak,
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
