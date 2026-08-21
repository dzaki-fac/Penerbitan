import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ExternalLink,
    FileText,
    History,
    LayoutTemplate,
    MessageSquarePlus,
    Pencil,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import CollapsibleCard from '@/components/collapsible-card';
import InputError from '@/components/input-error';
import NoteText from '@/components/note-text';
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
import {
    ADVANCE_BUTTON_CLASS,
    AUTHOR_ADVANCE_BUTTON_CLASS,
    AUTHOR_REVISION_BUTTON_CLASS,
    REVISION_BUTTON_CLASS,
    REVISION_STATUS_VALUES,
    activeContentClass,
    activeIndicatorClass,
    activeStatusClass,
    activeStatusLabel,
    DONE_STEP_CONNECTOR_CLASS,
    DONE_STEP_INDICATOR_CLASS,
    progressBarClass,
    statusBadgeClass,
    statusSubBadge,
    transitionButtonClass,
} from '@/lib/status';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import {
    approveProofReading,
    confirmRevisi,
    destroy,
    edit,
    index,
    markDiambil,
    rejectProofReading,
    transition,
} from '@/routes/admin/naskah';
import {
    destroy as catatanDestroy,
    store as storeCatatan,
    update as catatanUpdate,
} from '@/routes/admin/naskah/catatan';
import { update as isbnUpdate } from '@/routes/admin/naskah/isbn';
import { store as layoutStore } from '@/routes/admin/naskah/layout';
import type { NaskahDetail, WorkflowStep } from '@/types';

type AuthorAction = {
    aksi: string;
    label: string;
    to: string;
};

type Props = {
    naskah: NaskahDetail;
    steps: WorkflowStep[];
    adminTransitions: string[];
    statusOptions: Array<{ value: string; label: string }>;
    authorAction: AuthorAction | null;
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
    const form = useForm({
        to_status: target,
        catatan: '',
        nomor_isbn: naskah.isbn?.nomor_isbn ?? '',
        penerbit: naskah.isbn?.penerbit ?? '',
    });
    const targetLabel =
        statusOptions.find((s) => s.value === target)?.label ?? target;
    const isIsbnTerbit = target === 'isbn_terbit';

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const endpoint = isIsbnTerbit ? isbnUpdate : transition;
        form.post(endpoint.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className={cn(
                        'justify-center',
                        transitionButtonClass(target),
                    )}
                >
                    {targetLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isIsbnTerbit ? 'Ajukan ISBN Terbit' : 'Ubah Status'}
                    </DialogTitle>
                    <DialogDescription>
                        {isIsbnTerbit
                            ? 'Masukkan data ISBN untuk memindahkan naskah ke status "ISBN Terbit".'
                            : `Ubah status naskah dari "${naskah.status.label}" menjadi "${targetLabel}".`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Status Tujuan</Label>
                        <Input value={targetLabel} readOnly />
                    </div>
                    {isIsbnTerbit && (
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_isbn">Nomor ISBN</Label>
                                <Input
                                    id="nomor_isbn"
                                    value={form.data.nomor_isbn}
                                    onChange={(e) =>
                                        form.setData(
                                            'nomor_isbn',
                                            e.target.value,
                                        )
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
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">Catatan</Label>
                        <Textarea
                            id="catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder="Catatan untuk penulis, termasuk link upload revisi jika perlu"
                            rows={3}
                        />
                        <InputError message={form.errors.catatan} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={cn(
                                'justify-center',
                                transitionButtonClass(target),
                            )}
                        >
                            {form.processing && <Spinner />}
                            {isIsbnTerbit ? 'Ajukan & Terbitkan' : 'Konfirmasi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function JumpTransitionDialog({
    naskah,
    statusOptions,
}: {
    naskah: NaskahDetail;
    statusOptions: Array<{ value: string; label: string }>;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        to_status: '',
        catatan: '',
        force: true,
    });
    const isRevisionTarget = REVISION_STATUS_VALUES.includes(
        form.data.to_status,
    );

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
                <Button variant="outline" size="sm" className="justify-center">
                    Pindah ke Status Lain
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pindah ke Status Lain</DialogTitle>
                    <DialogDescription>
                        Pilih status tujuan dari tahap lain untuk melompatkan
                        atau memundurkan progress naskah sesuai kebutuhan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Status Tujuan</Label>
                        <Select
                            value={form.data.to_status}
                            onValueChange={(value) =>
                                form.setData('to_status', value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status tujuan" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions
                                    .filter(
                                        (s) => s.value !== naskah.status.value,
                                    )
                                    .map((s) => (
                                        <SelectItem
                                            key={s.value}
                                            value={s.value}
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.to_status} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="jump_catatan">Catatan</Label>
                        <Textarea
                            id="jump_catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder="Alasan pemindahan status, termasuk link upload revisi jika perlu"
                            rows={3}
                        />
                        <InputError message={form.errors.catatan} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            variant={isRevisionTarget ? 'outline' : 'default'}
                            className={cn(
                                'justify-center',
                                isRevisionTarget
                                    ? JUMP_REVISION_CLASS
                                    : JUMP_BUTTON_CLASS,
                            )}
                        >
                            {form.processing && <Spinner />}
                            Pindahkan Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Tombol "Pindah ke Status Lain": tetap solid, warna mengikuti status tujuan
// (revisi → merah, selain itu → hijau) agar konsisten dengan transisi biasa.
const JUMP_BUTTON_CLASS = ADVANCE_BUTTON_CLASS;
const JUMP_REVISION_CLASS = REVISION_BUTTON_CLASS;

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    );
}

function ExternalLinkValue({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    if (!value) {
        return (
            <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="text-right text-muted-foreground">-</dd>
            </div>
        );
    }

    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-right">
                <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate font-medium text-primary underline underline-offset-4"
                >
                    <span className="truncate">Buka link</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                </a>
            </dd>
        </div>
    );
}

function PengajuanCard({ naskah }: { naskah: NaskahDetail }) {
    return (
        <CollapsibleCard
            title="Data Pengajuan"
            icon={<FileText className="size-4 text-muted-foreground" />}
            contentClassName="space-y-4"
        >
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <p className="mb-2 text-sm font-semibold">Penulis</p>
                    <dl className="space-y-2 text-sm">
                        <Detail label="Status">
                            {naskah.author.status ?? '-'}
                        </Detail>
                        <Detail label="Fakultas / Sekolah">
                            {naskah.author.fakultas_sekolah ?? '-'}
                        </Detail>
                        <Detail label="Email">
                            {naskah.author.email ?? '-'}
                        </Detail>
                        <Detail label="Nomor NPWP">
                            {naskah.author.nomor_npwp ?? '-'}
                        </Detail>
                        <Detail label="No. WhatsApp">
                            {naskah.author.nomor_whatsapp ?? '-'}
                        </Detail>
                        <Detail label="Penulis Tambahan">
                            {naskah.author.penulis_tambahan ?? '-'}
                        </Detail>
                    </dl>
                </div>
                <div>
                    <p className="mb-2 text-sm font-semibold">
                        Naskah &amp; Narahubung
                    </p>
                    <dl className="space-y-2 text-sm">
                        <Detail label="Sumber Form">
                            {naskah.sumber_form ?? '-'}
                        </Detail>
                        <Detail label="Kebijakan Akses">
                            {naskah.kebijakan_akses ?? '-'}
                        </Detail>
                        <Detail label="Biaya">{naskah.biaya ?? '-'}</Detail>
                        <Detail label="Narahubung">
                            {naskah.nama_narahubung ?? '-'}
                        </Detail>
                        <Detail label="WhatsApp Narahubung">
                            {naskah.nomor_whatsapp_narahubung ?? '-'}
                        </Detail>
                        <Detail label="Email Narahubung">
                            {naskah.email_narahubung ?? '-'}
                        </Detail>
                    </dl>
                </div>
            </div>

            <Separator />

            <div>
                <p className="mb-2 text-sm font-semibold">
                    Dokumen &amp; Surat
                </p>
                <dl className="space-y-2 text-sm">
                    <ExternalLinkValue
                        label="Cover"
                        value={naskah.link_cover}
                    />
                    <ExternalLinkValue
                        label="Dummy (Upload)"
                        value={naskah.link_dummy_upload}
                    />
                    <ExternalLinkValue
                        label="Dummy PDF"
                        value={naskah.link_dummy_pdf}
                    />
                    <ExternalLinkValue
                        label="Dummy Word"
                        value={naskah.link_dummy_word}
                    />
                    <ExternalLinkValue
                        label="Surat Keaslian"
                        value={naskah.link_surat_keaslian}
                    />
                    <ExternalLinkValue
                        label="Surat Penerbitan"
                        value={naskah.link_surat_penerbitan}
                    />
                </dl>
            </div>
        </CollapsibleCard>
    );
}

function AdminConfirmRevisiDialog({ naskah }: { naskah: NaskahDetail }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ catatan: '' });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(confirmRevisi.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`justify-center ${AUTHOR_REVISION_BUTTON_CLASS}`}
                    size="sm"
                >
                    <User />
                    Konfirmasi Upload Revisi
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konfirmasi Upload Revisi</DialogTitle>
                    <DialogDescription>
                        Konfirmasi atas nama penulis bahwa revisi telah diunggah
                        ke link Drive.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin_confirm_catatan">Catatan</Label>
                        <Textarea
                            id="admin_confirm_catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder="Keterangan singkat (opsional)"
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

function AdminApproveProofReadingDialog({ naskah }: { naskah: NaskahDetail }) {
    const [open, setOpen] = useState(false);
    const form = useForm({});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(approveProofReading.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`justify-center ${AUTHOR_ADVANCE_BUTTON_CLASS}`}
                    size="sm"
                >
                    <User />
                    Acc Cetak
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Acc Cetak</DialogTitle>
                    <DialogDescription>
                        Setujui hasil final review atas nama penulis. Status
                        naskah dipindahkan ke "Acc Cetak".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={AUTHOR_ADVANCE_BUTTON_CLASS}
                        >
                            {form.processing && <Spinner />}
                            Setujui (Acc)
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AdminRejectProofReadingDialog({ naskah }: { naskah: NaskahDetail }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ catatan: '' });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(rejectProofReading.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`justify-center ${AUTHOR_REVISION_BUTTON_CLASS}`}
                    size="sm"
                >
                    <X />
                    Ajukan Revisi
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajukan Revisi Final Review</DialogTitle>
                    <DialogDescription>
                        Ajukan perbaikan atas nama penulis. Bagian yang perlu
                        diperbaiki dijelaskan pada catatan revisi.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin_reject_catatan">
                            Catatan Revisi
                        </Label>
                        <Textarea
                            id="admin_reject_catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder="Tuliskan catatan revisi"
                            rows={3}
                        />
                        <InputError message={form.errors.catatan} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={AUTHOR_REVISION_BUTTON_CLASS}
                        >
                            {form.processing && <Spinner />}
                            Ajukan Revisi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AdminMarkDiambilDialog({ naskah }: { naskah: NaskahDetail }) {
    const [open, setOpen] = useState(false);
    const form = useForm({});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(markDiambil.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`justify-center ${AUTHOR_ADVANCE_BUTTON_CLASS}`}
                    size="sm"
                >
                    <Check />
                    Buku Sudah Diambil
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buku Sudah Diambil</DialogTitle>
                    <DialogDescription>
                        Tandai buku telah diambil atas nama penulis. Status
                        naskah dipindahkan ke "Selesai".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={AUTHOR_ADVANCE_BUTTON_CLASS}
                        >
                            {form.processing && <Spinner />}
                            Konfirmasi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function LayoutPanel({ naskah }: { naskah: NaskahDetail }) {
    const form = useForm({
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
            title="Kirim Hasil Layout"
            description="Kirim link preview PDF hasil layout untuk direview penulis."
            icon={<LayoutTemplate className="size-4 text-muted-foreground" />}
            className="border-primary/30"
            contentClassName="space-y-4"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="preview_pdf_link">Link Preview PDF</Label>
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
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    Kirim &amp; Minta Review
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
                                <Badge
                                    className={statusBadgeClass(
                                        layout.status.value,
                                    )}
                                >
                                    {layout.status.label}
                                </Badge>
                                <div className="flex gap-2">
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

function CatatanCard({
    naskahId,
    catatan,
}: {
    naskahId: number;
    catatan: NaskahDetail['catatan'][number];
}) {
    function remove() {
        if (confirm('Hapus komentar ini?')) {
            router.delete(
                catatanDestroy.url({ naskah: naskahId, catatan: catatan.id }),
                { preserveScroll: true },
            );
        }
    }

    return (
        <div className="mt-2 rounded-md border border-border bg-muted/70 px-3 py-2">
            <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                    {catatan.author_name}
                </span>{' '}
                &middot; {catatan.waktu}
            </p>
            <p className="mt-1 text-sm">
                <NoteText text={catatan.isi} />
            </p>
            <div className="mt-1 flex items-center gap-3">
                <CatatanEditDialog naskahId={naskahId} catatan={catatan} />
                <button
                    type="button"
                    onClick={remove}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="size-3" />
                    Hapus
                </button>
            </div>
        </div>
    );
}

function CatatanEditDialog({
    naskahId,
    catatan,
}: {
    naskahId: number;
    catatan: NaskahDetail['catatan'][number];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({ isi: catatan.isi });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(
            catatanUpdate.url({ naskah: naskahId, catatan: catatan.id }),
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
                <Pencil className="size-3" />
                Edit
            </button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Komentar</DialogTitle>
                    <DialogDescription>
                        Ubah isi komentar ini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`catatan_edit_${catatan.id}`}>
                            Komentar
                        </Label>
                        <Textarea
                            id={`catatan_edit_${catatan.id}`}
                            value={form.data.isi}
                            onChange={(e) =>
                                form.setData('isi', e.target.value)
                            }
                            rows={3}
                            className="max-h-40 resize-none overflow-y-auto"
                        />
                        <InputError message={form.errors.isi} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function StepCatatanDialog({
    naskahId,
    stepValue,
}: {
    naskahId: number;
    stepValue: string;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        isi: '',
        target_type: 'stage',
        target_value: stepValue,
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(storeCatatan.url(naskahId), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                setOpen(o);

                if (o) {
                    form.reset();
                }
            }}
        >
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
                <MessageSquarePlus className="size-3" />
                Tambah Komentar
            </button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Komentar</DialogTitle>
                    <DialogDescription>
                        Komentar tambahan untuk tahap ini. Dapat ditambahkan
                        lebih dari satu kali.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="step_catatan_isi">Komentar</Label>
                        <Textarea
                            id="step_catatan_isi"
                            value={form.data.isi}
                            onChange={(e) =>
                                form.setData('isi', e.target.value)
                            }
                            placeholder="Tuliskan komentar untuk tahap ini"
                            rows={3}
                            className="max-h-40 resize-none overflow-y-auto"
                        />
                        <InputError message={form.errors.isi} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Kirim Komentar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function NaskahShow({
    naskah,
    steps,
    adminTransitions,
    statusOptions,
    authorAction,
}: Props) {
    const currentIndex = naskah.status.stage;
    const subBadge = statusSubBadge(naskah.status.value);

    // Saat status "Penulis Mundur": cari dari riwayat penulis_mundur status
    // terakhir yang dilalui (dari_status). Stage di atas titik tersebut dianggap
    // belum dilalui dan ditandai "x" di timeline.
    const withdrawnFromStage =
        naskah.status.value === 'penulis_mundur'
            ? naskah.histories.find(
                  (h) =>
                      h.ke_status.value === 'penulis_mundur' &&
                      h.dari_status !== null,
              )?.dari_status?.stage
            : undefined;

    const historyByStep = new Map<number, NaskahDetail['histories'][number]>();

    const latestEntered = new Map<number, NaskahDetail['histories'][number]>();
    const latestCompleted = new Map<
        number,
        NaskahDetail['histories'][number]
    >();

    for (const history of naskah.histories) {
        if (
            history.dari_status &&
            !latestCompleted.has(history.dari_status.stage)
        ) {
            latestCompleted.set(history.dari_status.stage, history);
        }

        if (!latestEntered.has(history.ke_status.stage)) {
            latestEntered.set(history.ke_status.stage, history);
        }
    }

    for (const step of steps) {
        let history: NaskahDetail['histories'][number] | undefined;

        if (step.stage < currentIndex) {
            history =
                latestCompleted.get(step.stage) ??
                latestEntered.get(step.stage);
        } else if (step.stage === currentIndex) {
            history = latestEntered.get(step.stage);
        }

        if (history) {
            historyByStep.set(step.stage, history);
        }
    }

    // Riwayat ISBN terbit dipakai sebagai penanda step tempat data ISBN tampil.
    const isbnHistory = naskah.histories.find(
        (h) => h.ke_status.value === 'isbn_terbit',
    );

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
                        <div className="space-y-1.5">
                            <h1 className="text-lg font-semibold">
                                {naskah.judul}
                            </h1>
                            <Badge
                                variant="secondary"
                                className={`h-auto max-w-full text-left whitespace-normal ${activeStatusClass(
                                    naskah.status.value,
                                )}`}
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
                        {naskah.link_cover && (
                            <a
                                href={naskah.link_cover}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4"
                            >
                                <ExternalLink className="size-4" />
                                Lihat Cover
                            </a>
                        )}
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
                    <PengajuanCard naskah={naskah} />

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
                                className={`h-full rounded-full border border-primary-foreground/20 transition-all duration-500 ${progressBarClass(naskah.progress)}`}
                                style={{ width: `${naskah.progress}%` }}
                            />
                        </div>
                        <ol className="space-y-0">
                            {steps.map((step, index) => {
                                const done =
                                    withdrawnFromStage !== undefined
                                        ? step.stage < withdrawnFromStage
                                        : index < currentIndex;
                                const active = index === currentIndex;
                                const skipped =
                                    withdrawnFromStage !== undefined &&
                                    index < currentIndex &&
                                    step.stage >= withdrawnFromStage;
                                const nextSkipped =
                                    withdrawnFromStage !== undefined &&
                                    index + 1 < currentIndex &&
                                    steps[index + 1].stage >=
                                        withdrawnFromStage;
                                const isLast = index === steps.length - 1;
                                const history = historyByStep.get(step.stage);
                                const stepCatatan =
                                    done || active
                                        ? naskah.catatan.filter(
                                              (c) =>
                                                  c.target_type === 'stage' &&
                                                  c.target_value === step.value,
                                          )
                                        : [];

                                return (
                                    <li
                                        key={step.value}
                                        className="relative flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            {active ? (
                                                <span
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                                        activeIndicatorClass(
                                                            naskah.status.value,
                                                        ),
                                                    )}
                                                >
                                                    <span className="text-xs font-semibold">
                                                        {index + 1}
                                                    </span>
                                                </span>
                                            ) : skipped ? (
                                                <span
                                                    className={
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-red-300 bg-red-50 text-red-500 transition-colors'
                                                    }
                                                >
                                                    <X className="size-4" />
                                                </span>
                                            ) : done ? (
                                                <span
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                                        DONE_STEP_INDICATOR_CLASS,
                                                    )}
                                                >
                                                    <Check className="size-4" />
                                                </span>
                                            ) : (
                                                <span
                                                    className={
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground transition-colors'
                                                    }
                                                >
                                                    <span className="text-xs font-semibold">
                                                        {index + 1}
                                                    </span>
                                                </span>
                                            )}
                                            {!isLast && (
                                                <span
                                                    className={cn(
                                                        'my-1 w-0.5 flex-1 rounded-full',
                                                        skipped || nextSkipped
                                                            ? 'bg-red-400/60'
                                                            : done
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
                                                        activeContentClass(
                                                            naskah.status.value,
                                                        ),
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
                                                            : skipped
                                                              ? 'text-muted-foreground'
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
                                                        className={activeStatusClass(
                                                            naskah.status.value,
                                                        )}
                                                    >
                                                        {activeStatusLabel(
                                                            naskah.status.value,
                                                        )}
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
                                                {(done || active) &&
                                                    history && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {history.waktu}
                                                        </span>
                                                    )}
                                            </div>
                                            {(done || active) &&
                                                stepCatatan.map((c) => (
                                                    <CatatanCard
                                                        key={c.id}
                                                        naskahId={naskah.id}
                                                        catatan={c}
                                                    />
                                                ))}
                                            {(done || active) && (
                                                <div className="mt-2">
                                                    <StepCatatanDialog
                                                        naskahId={naskah.id}
                                                        stepValue={step.value}
                                                    />
                                                </div>
                                            )}
                                            {isbnHistory &&
                                                index ===
                                                    isbnHistory.ke_status
                                                        .stage &&
                                                naskah.isbn?.nomor_isbn && (
                                                    <div className="mt-2 rounded-md border border-border bg-muted/70 px-3 py-2">
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            ISBN Terbit
                                                        </p>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                naskah.isbn
                                                                    .nomor_isbn
                                                            }
                                                        </p>
                                                        {naskah.isbn
                                                            .penerbit && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    naskah.isbn
                                                                        .penerbit
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                            {active &&
                                                adminTransitions.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Tindakan
                                                            selanjutnya:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {adminTransitions.map(
                                                                (target) => (
                                                                    <TransitionDialog
                                                                        key={
                                                                            target
                                                                        }
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

                                            {active && (
                                                <div className="mt-3">
                                                    <JumpTransitionDialog
                                                        naskah={naskah}
                                                        statusOptions={
                                                            statusOptions
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {active && authorAction && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Aksi penulis (dapat
                                                        dipicu admin atas nama
                                                        penulis):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {authorAction.aksi ===
                                                            'upload_revisi' && (
                                                            <AdminConfirmRevisiDialog
                                                                naskah={naskah}
                                                            />
                                                        )}
                                                        {authorAction.aksi ===
                                                            'review' && (
                                                            <>
                                                                <AdminApproveProofReadingDialog
                                                                    naskah={
                                                                        naskah
                                                                    }
                                                                />
                                                                <AdminRejectProofReadingDialog
                                                                    naskah={
                                                                        naskah
                                                                    }
                                                                />
                                                            </>
                                                        )}
                                                        {authorAction.aksi ===
                                                            'approve' && (
                                                            <AdminMarkDiambilDialog
                                                                naskah={naskah}
                                                            />
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

                {(naskah.status.value === 'dalam_proses_editing_layout' ||
                    naskah.status.value === 'revisi_editing_layout' ||
                    naskah.status.value === 'revisi_proof_reading') && (
                    <LayoutPanel naskah={naskah} />
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
                                        <NoteText text={history.catatan} />
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
                                            <NoteText
                                                text={revisi.catatan_penulis}
                                            />
                                        </p>
                                    )}
                                </div>
                                {revisi.file_url ? (
                                    <Button asChild variant="outline" size="sm">
                                        <a
                                            href={revisi.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Unduh
                                        </a>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        File diunggah ke link Drive
                                    </p>
                                )}
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
