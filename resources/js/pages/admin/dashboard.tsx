import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    BadgeCheck,
    BookOpenCheck,
    CircleCheck,
    Hourglass,
    ListChecks,
    RefreshCw,
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
import admin from '@/routes/admin';
import { index as naskahIndex } from '@/routes/admin/naskah';

type Props = {
    stats: {
        total: number;
        selesai: number;
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
};

export default function AdminDashboard({
    stats,
    statuses,
    isbnStatuses,
    recentHistories,
}: Props) {
    const summary = [
        { label: 'Total Naskah', value: stats.total, icon: BookOpenCheck },
        {
            label: 'Sedang Diproses',
            value: stats.sedang_proses,
            icon: ListChecks,
        },
        { label: 'Selesai', value: stats.selesai, icon: CircleCheck },
        {
            label: 'Penulis Mundur',
            value: stats.penulis_mundur,
            icon: UserMinus,
        },
    ];

    const isbnIcons = {
        proses: Hourglass,
        terbit: BadgeCheck,
        revisi: RefreshCw,
    } as const;

    const totalNaskah = Math.max(stats.total, 1);

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
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
                                    isbnIcons[
                                        status.value as keyof typeof isbnIcons
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
