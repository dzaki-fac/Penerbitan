import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { DatetimeInput } from '@/components/ui/datetime-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { FAKULTAS_OPTIONS } from '@/lib/fakultas';
import admin from '@/routes/admin';
import { index, store } from '@/routes/admin/naskah';

function toLocalDatetimeLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');

    return [
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    ].join('T');
}

export default function NaskahCreate() {
    const form = useForm({
        jenis_identitas: 'nim',
        nomor_identitas: '',
        nama: '',
        email: '',
        status: '',
        fakultas_sekolah: '',
        nomor_npwp: '',
        nomor_whatsapp: '',
        penulis_tambahan: '',
        judul: '',
        link_cover: '',
        tanggal_pengajuan: toLocalDatetimeLocal(new Date()),
        sumber_form: '',
        kebijakan_akses: '',
        biaya: '',
        nama_narahubung: '',
        nomor_whatsapp_narahubung: '',
        email_narahubung: '',
        link_dummy_upload: '',
        link_dummy_pdf: '',
        link_dummy_word: '',
        link_surat_keaslian: '',
        link_surat_penerbitan: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(store.url());
    }

    return (
        <>
            <Head title="Tambah Naskah" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Tambah Naskah</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan data naskah yang dikirim melalui Google
                            Form.
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
                                <Label htmlFor="jenis_identitas">
                                    Jenis Identitas
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['nim', 'nip'] as const).map((jenis) => (
                                        <button
                                            key={jenis}
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'jenis_identitas',
                                                    jenis,
                                                )
                                            }
                                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                                form.data.jenis_identitas ===
                                                jenis
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
                                <Label htmlFor="nomor_identitas">
                                    Nomor Identitas
                                </Label>
                                <Input
                                    id="nomor_identitas"
                                    value={form.data.nomor_identitas}
                                    onChange={(e) =>
                                        form.setData(
                                            'nomor_identitas',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="NIM / NIP"
                                />
                                <InputError
                                    message={form.errors.nomor_identitas}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama Penulis</Label>
                                <Input
                                    id="nama"
                                    value={form.data.nama}
                                    onChange={(e) =>
                                        form.setData('nama', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.nama} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (opsional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Input
                                    id="status"
                                    value={form.data.status}
                                    onChange={(e) =>
                                        form.setData('status', e.target.value)
                                    }
                                    placeholder="Dosen / Mahasiswa / ..."
                                />
                                <InputError message={form.errors.status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fakultas_sekolah">
                                    Fakultas / Sekolah
                                </Label>
                                <Combobox
                                    id="fakultas_sekolah"
                                    value={form.data.fakultas_sekolah}
                                    options={FAKULTAS_OPTIONS}
                                    onValueChange={(value) =>
                                        form.setData('fakultas_sekolah', value)
                                    }
                                    placeholder="Pilih atau ketik fakultas/sekolah"
                                />
                                <InputError
                                    message={form.errors.fakultas_sekolah}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_npwp">Nomor NPWP</Label>
                                <Input
                                    id="nomor_npwp"
                                    value={form.data.nomor_npwp}
                                    onChange={(e) =>
                                        form.setData(
                                            'nomor_npwp',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Opsional"
                                />
                                <InputError message={form.errors.nomor_npwp} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_whatsapp">
                                    Nomor WhatsApp
                                </Label>
                                <Input
                                    id="nomor_whatsapp"
                                    value={form.data.nomor_whatsapp}
                                    onChange={(e) =>
                                        form.setData(
                                            'nomor_whatsapp',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="08xxxxxxxxxx"
                                />
                                <InputError
                                    message={form.errors.nomor_whatsapp}
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="penulis_tambahan">
                                    Penulis Tambahan
                                </Label>
                                <Input
                                    id="penulis_tambahan"
                                    value={form.data.penulis_tambahan}
                                    onChange={(e) =>
                                        form.setData(
                                            'penulis_tambahan',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Nama penulis lain, dipisah koma (opsional)"
                                />
                                <InputError
                                    message={form.errors.penulis_tambahan}
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
                                <DatetimeInput
                                    id="tanggal_pengajuan"
                                    value={form.data.tanggal_pengajuan}
                                    onValueChange={(value) =>
                                        form.setData('tanggal_pengajuan', value)
                                    }
                                />
                                <InputError
                                    message={form.errors.tanggal_pengajuan}
                                />
                            </div>
                            <div className="grid gap-2">
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
                                    placeholder="URL atau ID respon Google Form (opsional)"
                                />
                                <InputError message={form.errors.sumber_form} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="kebijakan_akses">
                                    Kebijakan Akses
                                </Label>
                                <Input
                                    id="kebijakan_akses"
                                    value={form.data.kebijakan_akses}
                                    onChange={(e) =>
                                        form.setData(
                                            'kebijakan_akses',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Terbuka / Terbatas / ..."
                                />
                                <InputError
                                    message={form.errors.kebijakan_akses}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="biaya">Biaya</Label>
                                <Input
                                    id="biaya"
                                    value={form.data.biaya}
                                    onChange={(e) =>
                                        form.setData('biaya', e.target.value)
                                    }
                                    placeholder="Gratis / nominal / ..."
                                />
                                <InputError message={form.errors.biaya} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama_narahubung">
                                    Nama Narahubung
                                </Label>
                                <Input
                                    id="nama_narahubung"
                                    value={form.data.nama_narahubung}
                                    onChange={(e) =>
                                        form.setData(
                                            'nama_narahubung',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.nama_narahubung}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_whatsapp_narahubung">
                                    WhatsApp Narahubung
                                </Label>
                                <Input
                                    id="nomor_whatsapp_narahubung"
                                    value={form.data.nomor_whatsapp_narahubung}
                                    onChange={(e) =>
                                        form.setData(
                                            'nomor_whatsapp_narahubung',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="08xxxxxxxxxx"
                                />
                                <InputError
                                    message={
                                        form.errors.nomor_whatsapp_narahubung
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email_narahubung">
                                    Email Narahubung (opsional)
                                </Label>
                                <Input
                                    id="email_narahubung"
                                    type="email"
                                    value={form.data.email_narahubung}
                                    onChange={(e) =>
                                        form.setData(
                                            'email_narahubung',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.email_narahubung}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dokumen &amp; Surat</CardTitle>
                            <CardDescription>
                                Link Google Drive untuk dokumen dummy dan surat
                                pernyataan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="link_dummy_upload">
                                    Dokumen Dummy (Upload)
                                </Label>
                                <Input
                                    id="link_dummy_upload"
                                    type="url"
                                    value={form.data.link_dummy_upload}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_dummy_upload',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://drive.google.com/..."
                                />
                                <InputError
                                    message={form.errors.link_dummy_upload}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="link_dummy_pdf">
                                    Dummy Buku (PDF)
                                </Label>
                                <Input
                                    id="link_dummy_pdf"
                                    type="url"
                                    value={form.data.link_dummy_pdf}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_dummy_pdf',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://drive.google.com/..."
                                />
                                <InputError
                                    message={form.errors.link_dummy_pdf}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="link_dummy_word">
                                    Dummy Buku (Word)
                                </Label>
                                <Input
                                    id="link_dummy_word"
                                    type="url"
                                    value={form.data.link_dummy_word}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_dummy_word',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://drive.google.com/..."
                                />
                                <InputError
                                    message={form.errors.link_dummy_word}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="link_surat_keaslian">
                                    Surat Pernyataan Keaslian Naskah
                                </Label>
                                <Input
                                    id="link_surat_keaslian"
                                    type="url"
                                    value={form.data.link_surat_keaslian}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_surat_keaslian',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://drive.google.com/..."
                                />
                                <InputError
                                    message={form.errors.link_surat_keaslian}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="link_surat_penerbitan">
                                    Surat Pernyataan Penerbitan Buku
                                </Label>
                                <Input
                                    id="link_surat_penerbitan"
                                    type="url"
                                    value={form.data.link_surat_penerbitan}
                                    onChange={(e) =>
                                        form.setData(
                                            'link_surat_penerbitan',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://drive.google.com/..."
                                />
                                <InputError
                                    message={form.errors.link_surat_penerbitan}
                                />
                            </div>
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
