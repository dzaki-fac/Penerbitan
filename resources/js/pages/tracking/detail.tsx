import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    Check,
    ChevronLeft,
    ExternalLink,
    History,
    LayoutTemplate,
    User,
} from 'lucide-react';
import CollapsibleCard from '@/components/collapsible-card';
import NoteText from '@/components/note-text';
import { ActionPanel } from '@/components/tracking/action-panel';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    activeContentClass,
    activeIndicatorClass,
    activeStatusClass,
    activeStatusLabel,
    DONE_STEP_CONNECTOR_CLASS,
    DONE_STEP_INDICATOR_CLASS,
    needsAuthorAction,
    progressBarClass,
    statusBadgeClass,
    statusBorderClass,
    statusSubBadge,
} from '@/lib/status';
import { cn } from '@/lib/utils';
import type { NaskahDetail, TrackingAction, WorkflowStep } from '@/types';

type Props = {
    naskah: NaskahDetail;
    steps: WorkflowStep[];
    action: TrackingAction;
};

export default function TrackingDetail({ naskah, steps, action }: Props) {
    const currentIndex = naskah.status.stage;
    const perluAksi = needsAuthorAction(naskah.status.value);
    const subBadge = statusSubBadge(naskah.status.value);

    const historyByStep = new Map<number, NaskahDetail['histories'][number]>();

    for (const history of naskah.histories) {
        if (!historyByStep.has(history.ke_status.stage)) {
            historyByStep.set(history.ke_status.stage, history);
        }
    }

    // Riwayat ISBN terbit dipakai sebagai penanda step tempat data ISBN tampil.
    const isbnHistory = naskah.histories.find(
        (h) => h.ke_status.value === 'isbn_terbit',
    );

    return (
        <>
            <Head title={naskah.judul} />

            <div className="space-y-6">
                <a
                    href="/tracking"
                    onClick={(e) => {
                        if (window.history.length > 1) {
                            e.preventDefault();
                            window.history.back();
                        }
                    }}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Kembali ke daftar naskah
                </a>

                <div
                    className={`rounded-xl border ${statusBorderClass(naskah.status.value)} bg-card p-6`}
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={`h-auto max-w-full whitespace-normal text-left ${statusBadgeClass(naskah.status.value)}`}
                                >
                                    {naskah.status.label}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-[0.008em]">
                                {naskah.judul}
                            </h1>
                            {perluAksi && (
                                <p className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
                                    <AlertCircle className="size-4 shrink-0" />
                                    Naskah ini menunggu tindakan Anda — lihat
                                    bagian &quot;Aksi Penulis&quot; di bawah.
                                </p>
                            )}
                        </div>
                        <dl className="grid w-full shrink-0 grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 text-sm sm:w-auto sm:min-w-56">
                            <dt className="flex items-center gap-1.5 text-muted-foreground">
                                <User className="size-4" />
                                Penulis
                            </dt>
                            <dd className="text-right font-medium text-foreground">
                                {naskah.author.nama}
                            </dd>

                            <dt className="text-muted-foreground">
                                {naskah.author.jenis_identitas}
                            </dt>
                            <dd className="text-right text-foreground">
                                {naskah.author.nomor_identitas}
                            </dd>

                            <dt className="flex items-center gap-1.5 text-muted-foreground">
                                <CalendarDays className="size-4" />
                                Pengajuan
                            </dt>
                            <dd className="text-right text-foreground">
                                {naskah.tanggal_pengajuan}
                            </dd>

                            {naskah.link_cover && (
                                <>
                                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                                        <ExternalLink className="size-4" />
                                        Cover
                                    </dt>
                                    <dd className="text-right">
                                        <a
                                            href={naskah.link_cover}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                                        >
                                            Lihat Cover
                                        </a>
                                    </dd>
                                </>
                            )}
                        </dl>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Persentase Penyelesaian
                            </span>
                            <span className="font-semibold">
                                {naskah.progress}%
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={`h-full rounded-full border border-primary-foreground/20 transition-all duration-500 ${progressBarClass(naskah.status.value)}`}
                                style={{ width: `${naskah.progress}%` }}
                            />
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                        <History className="size-4 text-muted-foreground" />
                        Progress Workflow
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Tahapan proses penerbitan naskah Anda dari awal hingga
                        selesai.
                    </p>
                    <ol className="space-y-0">
                        {steps.map((step, index) => {
                            const done = index < currentIndex;
                            const active = index === currentIndex;
                            const isLast = index === steps.length - 1;
                            const history = historyByStep.get(step.stage);

                            return (
                                <li
                                    key={step.value}
                                    className="relative flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <span
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                                active
                                                    ? activeIndicatorClass(naskah.status.value)
                                                    : done
                                                      ? DONE_STEP_INDICATOR_CLASS
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
                                                    done
                                                        ? DONE_STEP_CONNECTOR_CLASS
                                                        : 'bg-border',
                                                )}
                                            />
                                        )}
                                    </div>

                                    <div
                                        className={cn(
                                            'min-w-0 flex-1 pt-1',
                                            active &&
                                                cn(
                                                    'rounded-lg p-3',
                                                    activeContentClass(naskah.status.value),
                                                ),
                                            !isLast && 'pb-6',
                                        )}
                                    >
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
                                                    className={activeStatusClass(naskah.status.value)}
                                                >
                                                    {activeStatusLabel(naskah.status.value)}
                                                </Badge>
                                            )}
                                            {active && subBadge && (
                                                <Badge
                                                    className={
                                                        subBadge.className
                                                    }
                                                >
                                                    {subBadge.label}
                                                </Badge>
                                            )}
                                            {history && (
                                                <span className="text-xs text-muted-foreground">
                                                    {history.waktu}
                                                </span>
                                            )}
                                        </div>
                                        {history?.catatan && (
                                            <div className="mt-2 rounded-md border border-border bg-muted/70 px-3 py-2">
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        Catatan admin
                                                        {history.admin
                                                            ? ` (${history.admin})`
                                                            : ''}
                                                        :
                                                    </span>{' '}
                                                    <NoteText
                                                        text={history.catatan}
                                                    />
                                                </p>
                                            </div>
                                        )}
                                        {isbnHistory &&
                                            index ===
                                                isbnHistory.ke_status.stage &&
                                            naskah.isbn?.nomor_isbn && (
                                                <div className="mt-2 rounded-md border border-border bg-muted/70 px-3 py-2">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        ISBN Terbit
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        {naskah.isbn.nomor_isbn}
                                                    </p>
                                                    {naskah.isbn.penerbit && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                naskah.isbn
                                                                    .penerbit
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        {active && action && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Aksi penulis:
                                                </p>
                                                <ActionPanel
                                                    naskah={naskah}
                                                    action={action}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <CollapsibleCard
                    title="Layout &amp; ISBN"
                    icon={
                        <LayoutTemplate className="size-4 text-muted-foreground" />
                    }
                    contentClassName="space-y-4"
                >
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Layout
                            </span>
                            {naskah.layout && (
                                <Badge
                                    className={statusBadgeClass(
                                        naskah.layout.status.value,
                                    )}
                                >
                                    {naskah.layout.status.label}
                                </Badge>
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
                                        Preview PDF (versi {naskah.layout.versi}
                                        )
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">
                                        Belum tersedia
                                    </span>
                                )}
                                {naskah.layout.catatan_revisi && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Catatan revisi:{' '}
                                        <NoteText
                                            text={naskah.layout.catatan_revisi}
                                        />
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
                                <Badge
                                    className={statusBadgeClass(
                                        naskah.isbn.status.value,
                                    )}
                                >
                                    {naskah.isbn.status.label}
                                </Badge>
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
                                        Catatan: <NoteText text={naskah.isbn.catatan} />
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

                {/*
                  Riwayat Aktivitas sengaja di-collapse (defaultOpen={false}) karena
                  informasinya sudah tercakup di "Progress Workflow" di atas. Ini
                  hanya log teknis lengkap untuk yang butuh detail lebih rinci
                  (misal ada status yang mundur/di-skip).
                  Kalau CollapsibleCard belum punya prop defaultOpen, tambahkan
                  dulu di komponennya (state useState(defaultOpen) untuk open/close).
                */}
                <CollapsibleCard
                    title="Riwayat Aktivitas (Log Lengkap)"
                    description="Detail teknis setiap perubahan status naskah."
                    icon={<History className="size-4 text-muted-foreground" />}
                    defaultOpen={false}
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
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
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
                                        <NoteText text={history.catatan} />
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