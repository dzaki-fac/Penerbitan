import { Head, Link } from '@inertiajs/react';
import { Activity, BookOpenCheck, CircleCheck, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import admin from '@/routes/admin';
import { index as naskahIndex } from '@/routes/admin/naskah';

type Props = {
    stats: {
        total: number;
        selesai: number;
        sedang_proses: number;
    };
    statuses: Array<{ value: string; label: string; progress: number; count: number }>;
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

export default function AdminDashboard({ stats, statuses, recentHistories }: Props) {
    const summary = [
        { label: 'Total Naskah', value: stats.total, icon: BookOpenCheck },
        { label: 'Sedang Diproses', value: stats.sedang_proses, icon: ListChecks },
        { label: 'Selesai', value: stats.selesai, icon: CircleCheck },
    ];

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
                                    <p className="text-2xl font-bold">{item.value}</p>
                                    <p className="text-sm text-muted-foreground">{item.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Naskah per Status</CardTitle>
                        <CardDescription>
                            Distribusi seluruh naskah berdasarkan tahapan workflow.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {statuses.map((status) => (
                                <Link
                                    key={status.value}
                                    href={naskahIndex({ query: { status: status.value } })}
                                    className="rounded-md border p-3 transition-colors hover:border-primary/50 hover:bg-accent/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium line-clamp-2">
                                            {status.label}
                                        </span>
                                        <Badge variant="secondary" className="ml-2 shrink-0">
                                            {status.count}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${status.progress}%` }}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="size-4 text-muted-foreground" />
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription>10 perubahan status terakhir.</CardDescription>
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
                                            {history.dari_status} → {history.ke_status}
                                        </span>
                                    )}
                                    <Badge variant="secondary" className="text-[10px]">
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
