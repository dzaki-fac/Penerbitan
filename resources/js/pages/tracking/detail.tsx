import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronLeft,
    FileText,
    History,
    LayoutTemplate,
    MessageSquareText,
    PenLine,
    User,
} from 'lucide-react';
import { ActionPanel } from '@/components/tracking/action-panel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { search } from '@/routes/tracking';
import type { NaskahDetail, TrackingAction, WorkflowStep } from '@/types';

type Props = {
    naskah: NaskahDetail;
    steps: WorkflowStep[];
    action: TrackingAction;
};

export default function TrackingDetail({ naskah, steps, action }: Props) {
    const currentIndex = steps.findIndex((s) => s.value === naskah.status.value);

    return (
        <>
            <Head title={naskah.judul} />

            <div className="space-y-6">
                <Link
                    href={search()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Kembali ke daftar naskah
                </Link>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {naskah.status.label}
                                </Badge>
                                {naskah.kategori && (
                                    <Badge variant="outline">{naskah.kategori}</Badge>
                                )}
                            </div>
                            <h1 className="text-2xl font-semibold tracking-[0.008em]">
                                {naskah.judul}
                            </h1>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center justify-end gap-1.5">
                                <User className="size-4" />
                                {naskah.author.nama}
                            </div>
                            <div>
                                {naskah.author.jenis_identitas}: {naskah.author.nomor_identitas}
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-1.5">
                                <CalendarDays className="size-4" />
                                {naskah.tanggal_pengajuan}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Persentase Penyelesaian</span>
                            <span className="font-semibold">{naskah.progress}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${naskah.progress}%` }}
                            />
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <History className="size-4 text-muted-foreground" />
                        Progress Workflow
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                        {steps.map((step, index) => {
                            const done = index < currentIndex;
                            const active = index === currentIndex;

                            return (
                                <div
                                    key={step.value}
                                    className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                                        active
                                            ? 'border-primary bg-primary/10 font-semibold text-primary'
                                            : done
                                              ? 'border-cobalt-surface/30 bg-lavender-wash text-foreground'
                                              : 'border-border bg-background text-muted-foreground'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        {done && <Check className="size-3" />}
                                        <span className="line-clamp-2">{step.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {naskah.catatan_admin && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <MessageSquareText className="size-4 text-muted-foreground" />
                                Catatan Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{naskah.catatan_admin}</p>
                        </CardContent>
                    </Card>
                )}

                {action && (
                    <Card className="border-primary/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <PenLine className="size-4 text-muted-foreground" />
                                Aksi Penulis
                            </CardTitle>
                            <CardDescription>
                                Aksi dilakukan tanpa login, cukup dengan NIM/NIP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActionPanel naskah={naskah} action={action} />
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FileText className="size-4 text-muted-foreground" />
                                Daftar Dokumen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {naskah.dokumens.map((dokumen) => (
                                <div
                                    key={dokumen.id}
                                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {dokumen.nama_dokumen}
                                        </p>
                                        {dokumen.catatan && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {dokumen.catatan}
                                            </p>
                                        )}
                                    </div>
                                    <Badge
                                        variant={
                                            dokumen.status.value === 'lengkap'
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        className="shrink-0"
                                    >
                                        {dokumen.status.label}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <LayoutTemplate className="size-4 text-muted-foreground" />
                                Layout &amp; ISBN
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Layout</span>
                                    {naskah.layout && (
                                        <Badge variant="outline">{naskah.layout.status.label}</Badge>
                                    )}
                                </div>
                                {naskah.layout ? (
                                    <div className="text-sm">
                                        {naskah.layout.preview_pdf_link ? (
                                            <a
                                                href={naskah.layout.preview_pdf_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline underline-offset-4"
                                            >
                                                Preview PDF (versi {naskah.layout.versi})
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Belum tersedia
                                            </span>
                                        )}
                                        {naskah.layout.catatan_revisi && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Catatan revisi: {naskah.layout.catatan_revisi}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada layout.
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">ISBN</span>
                                    {naskah.isbn && (
                                        <Badge variant="outline">{naskah.isbn.status.label}</Badge>
                                    )}
                                </div>
                                {naskah.isbn ? (
                                    <div className="text-sm">
                                        <p>
                                            {naskah.isbn.nomor_isbn ?? (
                                                <span className="text-muted-foreground">
                                                    Nomor belum tersedia
                                                </span>
                                            )}
                                        </p>
                                        {naskah.isbn.penerbit && (
                                            <p className="text-muted-foreground">
                                                {naskah.isbn.penerbit}
                                            </p>
                                        )}
                                        {naskah.isbn.catatan && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Catatan: {naskah.isbn.catatan}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada data ISBN.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <History className="size-4 text-muted-foreground" />
                            Riwayat Aktivitas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="relative border-s border-border ps-6">
                            {naskah.histories.map((history) => (
                                <li key={history.id} className="mb-6 last:mb-0">
                                    <span className="absolute -start-[7px] mt-1 size-3 rounded-full border-2 border-background bg-primary" />
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-medium">
                                            {history.ke_status.label}
                                        </span>
                                        {history.dari_status && (
                                            <span className="text-xs text-muted-foreground">
                                                (dari {history.dari_status.label})
                                            </span>
                                        )}
                                        <Badge variant="secondary" className="text-[10px]">
                                            {history.aktor.label}
                                        </Badge>
                                        {history.admin && (
                                            <span className="text-xs text-muted-foreground">
                                                oleh {history.admin}
                                            </span>
                                        )}
                                        <span className="ms-auto text-xs text-muted-foreground">
                                            {history.waktu}
                                        </span>
                                    </div>
                                    {history.catatan && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {history.catatan}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
