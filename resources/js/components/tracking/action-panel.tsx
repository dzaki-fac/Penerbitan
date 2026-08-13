import { useForm } from '@inertiajs/react';
import { Check, FileUp, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { diambil, revisi } from '@/routes/tracking';
import {
    approve as approveProofReading,
    reject as rejectProofReading,
} from '@/routes/tracking/proofreading';
import type { NaskahDetail, TrackingAction } from '@/types';

type Props = {
    naskah: NaskahDetail;
    action: TrackingAction;
};

type IdentityForm = {
    jenis_identitas: string;
    nomor_identitas: string;
};

function identityDefaults(naskah: NaskahDetail): IdentityForm {
    return {
        jenis_identitas: naskah.author.jenis_identitas.toLowerCase(),
        nomor_identitas: naskah.author.nomor_identitas,
    };
}

function IdentityFields({
    form,
    errors,
}: {
    form: ReturnType<typeof useForm<IdentityForm>>;
    errors: Record<string, string>;
}) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="jenis_identitas">Jenis Identitas</Label>
                <div className="grid grid-cols-2 gap-2">
                    {(['nim', 'nip'] as const).map((jenis) => (
                        <button
                            key={jenis}
                            type="button"
                            onClick={() =>
                                form.setData('jenis_identitas', jenis)
                            }
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                form.data.jenis_identitas === jenis
                                    ? 'border-cobalt-surface/40 bg-lavender-wash text-foreground'
                                    : 'border-input bg-background hover:bg-accent'
                            }`}
                        >
                            {jenis.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="nomor_identitas">Nomor Identitas</Label>
                <Input
                    id="nomor_identitas"
                    value={form.data.nomor_identitas}
                    onChange={(e) =>
                        form.setData('nomor_identitas', e.target.value)
                    }
                />
                <InputError message={errors.nomor_identitas} />
            </div>
        </div>
    );
}

function SubmitButton({
    processing,
    className,
    children,
}: {
    processing: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <Button type="submit" disabled={processing} className={className}>
            {processing && <Spinner />}
            {children}
        </Button>
    );
}

function ApproveDialog({
    naskah,
    title,
    description,
    submit,
    buttonLabel,
    icon,
    buttonClassName,
}: {
    naskah: NaskahDetail;
    title: string;
    description: string;
    submit: string;
    buttonLabel: string;
    icon?: React.ReactNode;
    buttonClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm(identityDefaults(naskah));

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(submit, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName}>
                    {icon}
                    {buttonLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <IdentityFields form={form} errors={form.errors} />
                    <DialogFooter>
                        <SubmitButton
                            processing={form.processing}
                            className={buttonClassName}
                        >
                            Konfirmasi
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RejectDialog({
    naskah,
    title,
    description,
    submit,
    buttonLabel,
    placeholder,
    buttonClassName,
}: {
    naskah: NaskahDetail;
    title: string;
    description: string;
    submit: string;
    buttonLabel: string;
    placeholder: string;
    buttonClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({ ...identityDefaults(naskah), catatan: '' });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(submit, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName}>
                    <X />
                    {buttonLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <IdentityFields form={form} errors={form.errors} />
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">Catatan Revisi</Label>
                        <Textarea
                            id="catatan"
                            value={form.data.catatan}
                            onChange={(e) =>
                                form.setData('catatan', e.target.value)
                            }
                            placeholder={placeholder}
                            rows={3}
                        />
                        <InputError message={form.errors.catatan} />
                    </div>
                    <DialogFooter>
                        <SubmitButton processing={form.processing}>
                            Ajukan Revisi
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ConfirmUploadRevisiDialog({ naskah }: { naskah: NaskahDetail }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        ...identityDefaults(naskah),
        catatan_penulis: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(revisi.url(naskah.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <FileUp />
                    Konfirmasi Upload Revisi
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konfirmasi Upload Revisi</DialogTitle>
                    <DialogDescription>
                        Unggah file revisi yang diminta ke link yang diberikan
                        admin pada catatan, lalu konfirmasi di sini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <IdentityFields form={form} errors={form.errors} />
                    <div className="grid gap-2">
                        <Label htmlFor="catatan_penulis">Catatan Penulis</Label>
                        <Textarea
                            id="catatan_penulis"
                            value={form.data.catatan_penulis}
                            onChange={(e) =>
                                form.setData('catatan_penulis', e.target.value)
                            }
                            placeholder="Keterangan singkat mengenai revisi (opsional)"
                            rows={3}
                        />
                        <InputError message={form.errors.catatan_penulis} />
                    </div>
                    <DialogFooter>
                        <SubmitButton processing={form.processing}>
                            Konfirmasi Upload
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Kelas warna tombol aksi. Acc dan Ajukan Revisi sengaja dibedakan warnanya
// (hijau vs merah) supaya kedua pilihan langsung kelihatan beda, tidak
// tertukar saat penulis buru-buru memilih.
const APPROVE_BUTTON_CLASS =
    'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/40';
const REJECT_BUTTON_CLASS =
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/40';

export function ActionPanel({ naskah, action }: Props) {
    if (!action) {
        return (
            <p className="text-sm text-muted-foreground">
                Tidak ada aksi yang menunggu penulis pada tahap ini.
            </p>
        );
    }

    if (action.jenis === 'upload_revisi') {
        return <ConfirmUploadRevisiDialog naskah={naskah} />;
    }

    if (action.jenis === 'review') {
        return (
            <div className="flex flex-wrap items-center gap-3">
                <ApproveDialog
                    naskah={naskah}
                    title="Acc Proof Reading"
                    description="Konfirmasi bahwa Anda menyetujui (Acc) hasil proof reading naskah."
                    submit={approveProofReading.url(naskah.id)}
                    buttonLabel="Acc Proof Reading"
                    icon={<Check />}
                    buttonClassName={APPROVE_BUTTON_CLASS}
                />
                <RejectDialog
                    naskah={naskah}
                    title="Ajukan Revisi Proof Reading"
                    description="Jelaskan bagian hasil proof reading yang perlu diperbaiki."
                    submit={rejectProofReading.url(naskah.id)}
                    buttonLabel="Ajukan Revisi"
                    placeholder="Tuliskan catatan revisi Anda"
                    buttonClassName={REJECT_BUTTON_CLASS}
                />
                {naskah.layout?.preview_pdf_link && (
                    <Button asChild variant="outline">
                        <a
                            href={naskah.layout.preview_pdf_link}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <RotateCcw />
                            Preview PDF
                        </a>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <ApproveDialog
            naskah={naskah}
            title="Buku Sudah Diambil"
            description="Konfirmasi bahwa Anda telah mengambil buku fisik hasil penerbitan."
            submit={diambil.url(naskah.id)}
            buttonLabel="Buku Sudah Diambil"
            icon={<Check />}
        />
    );
}