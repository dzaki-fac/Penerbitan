import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import { show, update } from '@/routes/admin/naskah';

type Props = {
    naskah: {
        id: number;
        judul: string;
        link_cover: string | null;
        tanggal_pengajuan: string;
        sumber_form: string | null;
        penulis: {
            nama: string;
            email: string | null;
            jenis_identitas: string;
            nomor_identitas: string;
        };
    };
};

export default function NaskahEdit({ naskah }: Props) {
    const form = useForm({
        judul: naskah.judul,
        link_cover: naskah.link_cover ?? '',
        tanggal_pengajuan: naskah.tanggal_pengajuan,
        sumber_form: naskah.sumber_form ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(update.url(naskah.id));
    }

    return (
        <>
            <Head title="Edit Naskah" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Edit Naskah</h1>
                        <p className="text-sm text-muted-foreground">
                            {naskah.judul}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={show(naskah.id)}>
                            <ArrowLeft />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Penulis</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label>Nama</Label>
                                <Input
                                    value={naskah.penulis.nama}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Identitas</Label>
                                <Input
                                    value={`${naskah.penulis.jenis_identitas} ${naskah.penulis.nomor_identitas}`}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input
                                    value={naskah.penulis.email ?? '-'}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Naskah</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="judul">Judul Naskah</Label>
                                <Input
                                    id="judul"
                                    value={form.data.judul}
                                    onChange={(e) =>
                                        form.setData('judul', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.judul} />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="link_cover">Link Cover</Label>
                                <Input
                                    id="link_cover"
                                    type="url"
                                    value={form.data.link_cover}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_cover',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="URL sampul/cover buku (mis. Google Drive)"
                                />
                                <InputError message={form.errors.link_cover} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_pengajuan">
                                    Tanggal Pengajuan
                                </Label>
                                <Input
                                    id="tanggal_pengajuan"
                                    type="date"
                                    value={form.data.tanggal_pengajuan}
                                    onChange={(e) =>
                                        form.setData(
                                            'tanggal_pengajuan',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.tanggal_pengajuan}
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="sumber_form">
                                    Sumber Google Form
                                </Label>
                                <Input
                                    id="sumber_form"
                                    value={form.data.sumber_form}
                                    onChange={(e) =>
                                        form.setData(
                                            'sumber_form',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.sumber_form} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button asChild variant="outline" type="button">
                            <Link href={show(naskah.id)}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

NaskahEdit.layout = {
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
