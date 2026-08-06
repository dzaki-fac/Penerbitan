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
import CollapsibleCard from '@/components/collapsible-card';
import { ActionPanel } from '@/components/tracking/action-panel';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { search } from '@/routes/tracking';
import type { NaskahDetail, TrackingAction, WorkflowStep } from '@/types';

type Props = {
    naskah: NaskahDetail;
    steps: WorkflowStep[];
    action: TrackingAction;
};

export default function TrackingDetail({ naskah, steps, action }: Props) {
    const currentIndex = steps.findIndex((s) => s.value === naskah.status.value);

    const historyByStep = new Map<string, NaskahDetail['histories'][number]>();

    for (const history of naskah.histories) {
        if (!historyByStep.has(history.ke_status.value)) {
            historyByStep.set(history.ke_status.value, history);
        }
    }

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
                    <ol className="space-y-0">
                        {steps.map((step, index) => {
                            const done = index < currentIndex;
                            const active = index === currentIndex;
                            const isLast = index === steps.length - 1;
                            const history = historyByStep.get(step.value);

                            return (
                                <li key={step.value} className="relative flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                                active
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : done
                                                      ? 'border-cobalt-surface/30 bg-lavender-wash text-primary'
                                                      : 'border-border bg-background text-muted-foreground',
                                            )}
                                        >
                                            {done ? (
                                                <Check className="size-4" />
                                            ) : (
                                                <span className="text-xs font-semibold">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </span>
                                        {!isLast && (
                                            <span
                                                className={cn(
                                                    'my-1 w-0.5 flex-1 rounded-full',
                                                    done ? 'bg-primary/40' : 'bg-border',
                                                )}
                                            />
                                        )}
                                    </div>

                                    <div className={cn('min-w-0 flex-1 pt-1', !isLast && 'pb-6')}>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span
                                                className={cn(
                                                    'text-sm font-medium',
                                                    active
                                                        ? 'text-primary'
                                                        : done
                                                          ? 'text-foreground'
                                                          : 'text-muted-foreground',
                                                )}
                                            >
                                                {step.label}
                                            </span>
                                            {active && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary"
                                                >
                                                    Sedang berjalan
                                                </Badge>
                                            )}
                                            {history && (
                                                <span className="text-xs text-muted-foreground">
                                                    {history.waktu}
                                                </span>
                                            )}
                                        </div>
                                        {history?.catatan && (
                                            <div className="mt-2 rounded-md border border-border bg-lavender-wash/60 px-3 py-2">
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        Catatan admin
                                                        {history.admin
                                                            ? ` (${history.admin})`
                                                            : ''}
                                                        :
                                                    </span>{' '}
                                                    {history.catatan}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {naskah.catatan_admin && (
                    <CollapsibleCard
                        title="Catatan Admin"
                        icon={<MessageSquareText className="size-4 text-muted-foreground" />}
                    >
                        <p className="text-sm">{naskah.catatan_admin}</p>
                    </CollapsibleCard>
                )}

                {action && (
                    <CollapsibleCard
                        title="Aksi Penulis"
                        description="Aksi dilakukan tanpa login, cukup dengan NIM/NIP."
                        icon={<PenLine className="size-4 text-muted-foreground" />}
                        className="border-primary/40"
                    >
                        <ActionPanel naskah={naskah} action={action} />
                    </CollapsibleCard>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <CollapsibleCard
                        title="Daftar Dokumen"
                        icon={<FileText className="size-4 text-muted-foreground" />}
                        contentClassName="space-y-3"
                    >
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
                    </CollapsibleCard>

                    <CollapsibleCard
                        title="Layout &amp; ISBN"
                        icon={<LayoutTemplate className="size-4 text-muted-foreground" />}
                        contentClassName="space-y-4"
                    >
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
                    </CollapsibleCard>
                </div>

                <CollapsibleCard
                    title="Riwayat Aktivitas"
                    icon={<History className="size-4 text-muted-foreground" />}
                >
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
                </CollapsibleCard>
            </div>
        </>
    );
}
