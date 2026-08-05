import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';
import { index, store } from '@/routes/admin/naskah';

export default function NaskahCreate() {
    const form = useForm({
        jenis_identitas: 'nim',
        nomor_identitas: '',
        nama: '',
        email: '',
        judul: '',
        abstrak: '',
        kategori: '',
        tanggal_pengajuan: new Date().toISOString().slice(0, 10),
        sumber_form: '',
        dokumen: ['Naskah Utuh', 'Abstrak', 'Pernyataan Orisinalitas'],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(store.url());
    }

    function setDokumen(index: number, value: string) {
        const dokumen = [...form.data.dokumen];
        dokumen[index] = value;
        form.setData('dokumen', dokumen);
    }

    function addDokumen() {
        form.setData('dokumen', [...form.data.dokumen, '']);
    }

    function removeDokumen(index: number) {
        form.setData(
            'dokumen',
            form.data.dokumen.filter((_, i) => i !== index),
        );
    }

    return (
        <>
            <Head title="Tambah Naskah" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Tambah Naskah</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan data naskah yang dikirim melalui Google Form.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={index()}>
                            <ArrowLeft />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Penulis</CardTitle>
                            <CardDescription>
                                Penulis diidentifikasi berdasarkan NIM atau NIP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="jenis_identitas">Jenis Identitas</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['nim', 'nip'] as const).map((jenis) => (
                                        <button
                                            key={jenis}
                                            type="button"
                                            onClick={() => form.setData('jenis_identitas', jenis)}
                                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                                form.data.jenis_identitas === jenis
                                                    ? 'border-primary bg-primary text-primary-foreground'
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
                                    onChange={(e) => form.setData('nomor_identitas', e.target.value)}
                                    placeholder="NIM / NIP"
                                />
                                <InputError message={form.errors.nomor_identitas} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama Penulis</Label>
                                <Input
                                    id="nama"
                                    value={form.data.nama}
                                    onChange={(e) => form.setData('nama', e.target.value)}
                                />
                                <InputError message={form.errors.nama} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (opsional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                />
                                <InputError message={form.errors.email} />
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
                                    onChange={(e) => form.setData('judul', e.target.value)}
                                />
                                <InputError message={form.errors.judul} />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="abstrak">Abstrak</Label>
                                <Textarea
                                    id="abstrak"
                                    value={form.data.abstrak}
                                    onChange={(e) => form.setData('abstrak', e.target.value)}
                                    rows={4}
                                />
                                <InputError message={form.errors.abstrak} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="kategori">Kategori</Label>
                                <Input
                                    id="kategori"
                                    value={form.data.kategori}
                                    onChange={(e) => form.setData('kategori', e.target.value)}
                                    placeholder="Fiksi, Non-fiksi, Ilmiah, dll."
                                />
                                <InputError message={form.errors.kategori} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_pengajuan">Tanggal Pengajuan</Label>
                                <Input
                                    id="tanggal_pengajuan"
                                    type="date"
                                    value={form.data.tanggal_pengajuan}
                                    onChange={(e) => form.setData('tanggal_pengajuan', e.target.value)}
                                />
                                <InputError message={form.errors.tanggal_pengajuan} />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="sumber_form">Sumber Google Form</Label>
                                <Input
                                    id="sumber_form"
                                    value={form.data.sumber_form}
                                    onChange={(e) => form.setData('sumber_form', e.target.value)}
                                    placeholder="URL atau ID respon Google Form (opsional)"
                                />
                                <InputError message={form.errors.sumber_form} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dokumen yang Diperlukan</CardTitle>
                            <CardDescription>
                                Daftar dokumen yang harus diverifikasi kelengkapannya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {form.data.dokumen.map((nama, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={nama}
                                        onChange={(e) => setDokumen(index, e.target.value)}
                                        placeholder="Nama dokumen"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeDokumen(index)}
                                        className="shrink-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addDokumen}>
                                <Plus />
                                Tambah Dokumen
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button asChild variant="outline" type="button">
                            <Link href={index()}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan Naskah
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

NaskahCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard(),
        },
        {
            title: 'Data Naskah',
            href: admin.naskah.index(),
        },
        {
            title: 'Tambah Naskah',
            href: admin.naskah.create(),
        },
    ],
};
