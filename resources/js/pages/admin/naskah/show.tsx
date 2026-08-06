import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    FileText,
    History,
    LayoutTemplate,
    MessageSquareText,
    Pencil,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import CollapsibleCard from '@/components/collapsible-card';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { update as dokumenUpdate } from '@/routes/admin/dokumen';
import { destroy, edit, index, transition } from '@/routes/admin/naskah';
import { update as catatanUpdate } from '@/routes/admin/naskah/catatan';
import { update as isbnUpdate } from '@/routes/admin/naskah/isbn';
import { store as layoutStore } from '@/routes/admin/naskah/layout';
import type { NaskahDetail, WorkflowStep } from '@/types';

type Props = {
    naskah: NaskahDetail;
    steps: WorkflowStep[];
    adminTransitions: string[];
    statusOptions: Array<{ value: string; label: string }>;
};

function TransitionDialog({
    naskah,
    target,
    statusOptions,
}: {
    naskah: NaskahDetail;
    target: string;
    statusOptions: Array<{ value: string; label: string }>;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({ to_status: target, catatan: '' });
    const targetLabel =
        statusOptions.find((s) => s.value === target)?.label ?? target;

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(transition.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="justify-center"
                >
                    {targetLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ubah Status</DialogTitle>
                    <DialogDescription>
                        Ubah status naskah dari "{naskah.status.label}" menjadi
                        "{targetLabel}".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Status Tujuan</Label>
                        <Input value={targetLabel} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">Catatan</Label>
                        <Textarea
                            id="catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder="Catatan untuk penulis (opsional)"
                            rows={3}
                        />
                        <InputError message={form.errors.catatan} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Konfirmasi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DokumenPanel({ naskah }: { naskah: NaskahDetail }) {
    return (
        <CollapsibleCard
            title="Verifikasi Dokumen"
            description="Tandai kelengkapan setiap dokumen pengajuan."
            icon={<FileText className="size-4 text-muted-foreground" />}
            contentClassName="space-y-4"
        >
            {naskah.dokumens.map((dokumen) => (
                <DokumenRow key={dokumen.id} dokumen={dokumen} />
            ))}
        </CollapsibleCard>
    );
}

function DokumenRow({
    dokumen,
}: {
    dokumen: NaskahDetail['dokumens'][number];
}) {
    const form = useForm({
        status: dokumen.status.value,
        catatan: dokumen.catatan ?? '',
        file: null as File | null,
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(dokumenUpdate.url(dokumen.id), {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={onSubmit} className="space-y-3 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                        {dokumen.nama_dokumen}
                    </p>
                    {dokumen.file_url && (
                        <a
                            href={dokumen.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary underline underline-offset-4"
                        >
                            Lihat file
                        </a>
                    )}
                </div>
                <Badge variant="secondary">{dokumen.status.label}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                        value={form.data.status || undefined}
                        onValueChange={(v) => form.setData('status', v)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="belum">Belum</SelectItem>
                            <SelectItem value="lengkap">Lengkap</SelectItem>
                            <SelectItem value="perlu_perbaikan">
                                Perlu Perbaikan
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`catatan-${dokumen.id}`}>Catatan</Label>
                    <Input
                        id={`catatan-${dokumen.id}`}
                        value={form.data.catatan}
                        onChange={(e) =>
                            form.setData('catatan', e.target.value)
                        }
                        placeholder="Catatan (opsional)"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`file-${dokumen.id}`}>File</Label>
                    <Input
                        id={`file-${dokumen.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                        onChange={(e) =>
                            form.setData('file', e.target.files?.[0] ?? null)
                        }
                    />
                </div>
            </div>
            <InputError
                message={
                    form.errors.status ||
                    form.errors.catatan ||
                    form.errors.file
                }
            />
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    Simpan
                </Button>
            </div>
        </form>
    );
}

function LayoutPanel({ naskah }: { naskah: NaskahDetail }) {
    const form = useForm({
        file_layout: null as File | null,
        preview_pdf_link: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(layoutStore.url(naskah.id), {
            preserveScroll: true,
        });
    }

    return (
        <CollapsibleCard
            title="Unggah Hasil Layout"
            description="Unggah file layout dan link preview PDF untuk direview penulis."
            icon={<LayoutTemplate className="size-4 text-muted-foreground" />}
            className="border-primary/30"
            contentClassName="space-y-4"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="file_layout">File Layout (PDF)</Label>
                        <Input
                            id="file_layout"
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                form.setData(
                                    'file_layout',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={form.errors.file_layout} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="preview_pdf_link">
                            Link Preview PDF
                        </Label>
                        <Input
                            id="preview_pdf_link"
                            value={form.data.preview_pdf_link}
                            onChange={(e) =>
                                form.setData('preview_pdf_link', e.target.value)
                            }
                            placeholder="https://drive.google.com/..."
                        />
                        <InputError message={form.errors.preview_pdf_link} />
                    </div>
                </div>
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    <Upload />
                    Unggah &amp; Minta Review
                </Button>
            </form>

            {naskah.layouts && naskah.layouts.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Riwayat Layout</p>
                        {naskah.layouts.map((layout) => (
                            <div
                                key={layout.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        Versi {layout.versi}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {layout.tanggal}
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {layout.status.label}
                                </Badge>
                                <div className="flex gap-2">
                                    {layout.file_url && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={layout.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                File
                                            </a>
                                        </Button>
                                    )}
                                    {layout.preview_pdf_link && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={layout.preview_pdf_link}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Preview
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </CollapsibleCard>
    );
}

function IsbnPanel({ naskah }: { naskah: NaskahDetail }) {
    const form = useForm({
        nomor_isbn: naskah.isbn?.nomor_isbn ?? '',
        penerbit: naskah.isbn?.penerbit ?? '',
        catatan: naskah.isbn?.catatan ?? '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(isbnUpdate.url(naskah.id), {
            preserveScroll: true,
        });
    }

    return (
        <CollapsibleCard
            title="Pengajuan ISBN"
            description="Ajukan data ISBN untuk persetujuan penulis."
            icon={<Check className="size-4 text-muted-foreground" />}
            className="border-primary/30"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="nomor_isbn">Nomor ISBN</Label>
                        <Input
                            id="nomor_isbn"
                            value={form.data.nomor_isbn}
                            onChange={(e) =>
                                form.setData('nomor_isbn', e.target.value)
                            }
                            placeholder="978-602-0000-00-0"
                        />
                        <InputError message={form.errors.nomor_isbn} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="penerbit">Penerbit</Label>
                        <Input
                            id="penerbit"
                            value={form.data.penerbit}
                            onChange={(e) =>
                                form.setData('penerbit', e.target.value)
                            }
                        />
                        <InputError message={form.errors.penerbit} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="isbn_catatan">Catatan</Label>
                    <Textarea
                        id="isbn_catatan"
                        value={form.data.catatan}
                        onChange={(e) =>
                            form.setData('catatan', e.target.value)
                        }
                        rows={2}
                    />
                    <InputError message={form.errors.catatan} />
                </div>
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    Ajukan untuk Persetujuan
                </Button>
            </form>
        </CollapsibleCard>
    );
}

function CatatanPanel({ naskah }: { naskah: NaskahDetail }) {
    const form = useForm({ catatan_admin: naskah.catatan_admin ?? '' });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(catatanUpdate.url(naskah.id), {
            preserveScroll: true,
        });
    }

    return (
        <CollapsibleCard
            title="Catatan Admin"
            icon={
                <MessageSquareText className="size-4 text-muted-foreground" />
            }
        >
            <form onSubmit={onSubmit} className="space-y-3">
                <Textarea
                    value={form.data.catatan_admin}
                    onChange={(e) =>
                        form.setData('catatan_admin', e.target.value)
                    }
                    rows={3}
                    placeholder="Catatan yang akan terlihat penulis di halaman tracking"
                />
                <InputError message={form.errors.catatan_admin} />
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={form.processing}>
                        {form.processing && <Spinner />}
                        Simpan Catatan
                    </Button>
                </div>
            </form>
        </CollapsibleCard>
    );
}

export default function NaskahShow({
    naskah,
    steps,
    adminTransitions,
    statusOptions,
}: Props) {
    const currentIndex = steps.findIndex(
        (s) => s.value === naskah.status.value,
    );

    const historyByStep = new Map<string, NaskahDetail['histories'][number]>();

    for (const history of naskah.histories) {
        if (!historyByStep.has(history.ke_status.value)) {
            historyByStep.set(history.ke_status.value, history);
        }
    }

    function remove() {
        if (confirm('Hapus naskah ini?')) {
            router.delete(destroy(naskah.id));
        }
    }

    return (
        <>
            <Head title={naskah.judul} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="-ml-2 text-muted-foreground"
                        >
                            <Link href={index()}>
                                <ArrowLeft />
                                Data Naskah
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-semibold">
                                {naskah.judul}
                            </h1>
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                            >
                                {naskah.status.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {naskah.author.nama} (
                            {naskah.author.jenis_identitas}:{' '}
                            {naskah.author.nomor_identitas}) · Pengajuan{' '}
                            {naskah.tanggal_pengajuan}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={edit(naskah.id)}>
                                <Pencil />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={remove}
                        >
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <CollapsibleCard
                        title="Progress Workflow"
                        icon={
                            <History className="size-4 text-muted-foreground" />
                        }
                        contentClassName="space-y-3"
                    >
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
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${naskah.progress}%` }}
                            />
                        </div>
                        <ol className="space-y-0">
                            {steps.map((step, index) => {
                                const done = index < currentIndex;
                                const active = index === currentIndex;
                                const isLast = index === steps.length - 1;
                                const history = historyByStep.get(step.value);

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
                                                        done
                                                            ? 'bg-primary/40'
                                                            : 'bg-border',
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <div
                                            className={cn(
                                                'min-w-0 flex-1 pt-1',
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

                                            {active &&
                                                adminTransitions.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Tindakan selanjutnya:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {adminTransitions.map(
                                                                (target) => (
                                                                    <TransitionDialog
                                                                        key={target}
                                                                        naskah={
                                                                            naskah
                                                                        }
                                                                        target={
                                                                            target
                                                                        }
                                                                        statusOptions={
                                                                            statusOptions
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </CollapsibleCard>
                </div>

                <DokumenPanel naskah={naskah} />

                <CatatanPanel naskah={naskah} />

                {(naskah.status.value === 'dalam_proses_editing_layout' ||
                    naskah.status.value === 'revisi_editing_layout') && (
                    <LayoutPanel naskah={naskah} />
                )}

                {(naskah.status.value === 'pengajuan_isbn' ||
                    naskah.status.value === 'revisi_isbn') && (
                    <IsbnPanel naskah={naskah} />
                )}

                <CollapsibleCard
                    title="Riwayat Aktivitas"
                    icon={<History className="size-4 text-muted-foreground" />}
                >
                    <ol className="relative border-s border-border ps-6">
                        {naskah.histories.map((history) => (
                            <li key={history.id} className="mb-5 last:mb-0">
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
                                        {history.catatan}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ol>
                </CollapsibleCard>

                {naskah.revisi_uploads.length > 0 && (
                    <CollapsibleCard
                        title="Revisi dari Penulis"
                        icon={
                            <Upload className="size-4 text-muted-foreground" />
                        }
                        contentClassName="space-y-2"
                    >
                        {naskah.revisi_uploads.map((revisi) => (
                            <div
                                key={revisi.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {revisi.jenis.label} · {revisi.tanggal}
                                    </p>
                                    {revisi.catatan_penulis && (
                                        <p className="text-xs text-muted-foreground">
                                            {revisi.catatan_penulis}
                                        </p>
                                    )}
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={revisi.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Unduh
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </CollapsibleCard>
                )}
            </div>
        </>
    );
}

NaskahShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
        {
            title: 'Data Naskah',
            href: admin.naskah.index(),
        },
    ],
};
