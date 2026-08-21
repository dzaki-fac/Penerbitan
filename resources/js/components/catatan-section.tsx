import { useForm } from '@inertiajs/react';
import { MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import NoteText from '@/components/note-text';
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
    store as storeCatatan,
} from '@/routes/admin/naskah/catatan';

type CatatanItem = {
    id: number;
    author_name: string;
    isi: string;
    target_type: string;
    target_value: string | null;
    waktu: string;
};

type StageOption = {
    value: string;
    label: string;
};

type Props = {
    naskahId: number;
    catatan: CatatanItem[];
    stages: StageOption[];
};

export default function CatatanSection({ naskahId, catatan, stages }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        isi: '',
        target_type: 'general' as 'general' | 'stage',
        target_value: '' as string | '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(storeCatatan.url(naskahId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('isi');
                setOpen(false);
            },
        });
    }

    const generalCatatan = catatan.filter((c) => c.target_type === 'general');
    const stageCatatan = catatan.filter((c) => c.target_type === 'stage');

    const getStageLabel = (value: string | null) =>
        stages.find((s) => s.value === value)?.label ?? value ?? '';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                    {catatan.length > 0
                        ? `${catatan.length} catatan`
                        : 'Belum ada catatan'}
                </p>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <MessageSquarePlus className="size-4" />
                            Tambah Catatan
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Catatan</DialogTitle>
                            <DialogDescription>
                                Catatan ini akan terlihat oleh admin di halaman detail naskah.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="catatan_target_type">Jenis Catatan</Label>
                                <Select
                                    value={form.data.target_type}
                                    onValueChange={(v) =>
                                        form.setData('target_type', v as 'general' | 'stage')
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">Catatan Umum</SelectItem>
                                        <SelectItem value="stage">Catatan per Tahap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.data.target_type === 'stage' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="catatan_target_value">Tahap</Label>
                                    <Select
                                        value={form.data.target_value}
                                        onValueChange={(v) =>
                                            form.setData('target_value', v)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih tahap" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stages.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.target_value} />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="catatan_isi">Isi Catatan</Label>
                                <Textarea
                                    id="catatan_isi"
                                    value={form.data.isi}
                                    onChange={(e) =>
                                        form.setData('isi', e.target.value)
                                    }
                                    placeholder="Tuliskan catatan di sini..."
                                    rows={4}
                                />
                                <InputError message={form.errors.isi} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <Spinner />}
                                    Simpan Catatan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {catatan.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Klik &quot;Tambah Catatan&quot; untuk menulis catatan pada naskah ini.
                </p>
            )}

            {generalCatatan.length > 0 && (
                <div className="space-y-2">
                    {catatan.length > 0 && stageCatatan.length > 0 && (
                        <p className="text-xs font-medium text-muted-foreground">
                            Catatan Umum
                        </p>
                    )}
                    {generalCatatan.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-md border border-border bg-muted/70 px-3 py-2"
                        >
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {c.author_name}
                                </span>{' '}
                                · {c.waktu}
                            </p>
                            <p className="mt-1 text-sm">
                                <NoteText text={c.isi} />
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {stageCatatan.length > 0 && (
                <div className="space-y-2">
                    {generalCatatan.length > 0 && (
                        <>
                            <Separator />
                            <p className="text-xs font-medium text-muted-foreground">
                                Catatan per Tahap
                            </p>
                        </>
                    )}
                    {stageCatatan.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-md border border-border bg-muted/70 px-3 py-2"
                        >
                            <div className="flex flex-wrap items-center gap-x-2">
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {c.author_name}
                                    </span>{' '}
                                    · {c.waktu}
                                </p>
                                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                    {getStageLabel(c.target_value)}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">
                                <NoteText text={c.isi} />
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
