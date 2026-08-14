import { Head, Link } from '@inertiajs/react';
import { Activity, BookOpenCheck, CircleCheck, ListChecks } from 'lucide-react';
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
    };
    statuses: Array<{
        value: string;
        label: string;
        stage: number;
        progress: number;
        count: number;
    }>;
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
    ];

    const maxCount = Math.max(...statuses.map((s) => s.count), 1);

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="grid gap-4 md:grid-cols-3">
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
                        <CardTitle>Naskah per Status</CardTitle>
                        <CardDescription>
                            Distribusi seluruh naskah berdasarkan tahapan
                            workflow.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {statuses.map((status) => (
                                <Link
                                    key={status.value}
                                    href={naskahIndex({
                                        query: { stage: status.stage },
                                    })}
                                    title={`Lihat naskah pada tahapan "${status.label}"`}
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
                                                    ? `${Math.max((status.count / maxCount) * 100, 4)}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="w-9 shrink-0 justify-center"
                                    >
                                        {status.count}
                                    </Badge>
                                </Link>
                            ))}
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
