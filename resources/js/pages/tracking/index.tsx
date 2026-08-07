import { Head, useForm } from '@inertiajs/react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { search } from '@/routes/tracking';

const METODE = [
    { key: 'nim', label: 'NIM', keterangan: 'Mahasiswa' },
    { key: 'nip', label: 'NIP', keterangan: 'Dosen / Staf' },
    { key: 'email', label: 'Email', keterangan: 'Jika lupa NIM/NIP' },
] as const;

export default function TrackingIndex() {
    const { data, setData, post, errors, processing } = useForm({
        jenis_identitas: 'nim' as 'nim' | 'nip' | 'email',
        nomor_identitas: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(search.url());
    }

    const placeholder =
        data.jenis_identitas === 'email'
            ? 'Contoh: penulis@email.com'
            : 'Contoh: 21111000 atau 198501012010121001';

    return (
        <>
            <Head title="Tracking Naskah" />

            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="mx-auto max-w-xl text-center">
                    <span className="inline-flex items-center rounded-full bg-lavender-wash px-4 py-1 text-sm font-medium tracking-[0.004em] text-foreground">
                        Tracking Penerbitan
                    </span>
                    <h1 className="mt-6 text-4xl font-semibold tracking-[0.016em] sm:text-5xl">
                        Lacak Proses Penerbitan Naskah Anda
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground">
                        Masukkan NIM, NIP, atau email untuk melihat seluruh naskah
                        dan perkembangan proses penerbitan Anda.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="mt-10 w-full max-w-lg space-y-6 rounded-xl border border-border bg-card p-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="jenis_identitas">Cari Berdasarkan</Label>
                        <p className="text-xs text-muted-foreground">
                            Pilih jenis identitas yang Anda gunakan saat mendaftar.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {METODE.map(({ key, label, keterangan }) => {
                                const active = data.jenis_identitas === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setData('jenis_identitas', key)}
                                        aria-pressed={active}
                                        className={`relative flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                                            active
                                                ? 'border-cobalt-surface/40 bg-lavender-wash text-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        }`}
                                    >
                                        {active && (
                                            <Check className="absolute right-1.5 top-1.5 size-3.5 text-primary" />
                                        )}
                                        <span>{label}</span>
                                        <span className="text-[11px] font-normal text-muted-foreground">
                                            {keterangan}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="nomor_identitas">
                            {data.jenis_identitas === 'email' ? 'Alamat Email' : 'Nomor Identitas'}
                        </Label>
                        <Input
                            id="nomor_identitas"
                            type={data.jenis_identitas === 'email' ? 'email' : 'text'}
                            value={data.nomor_identitas}
                            onChange={(e) => setData('nomor_identitas', e.target.value)}
                            placeholder={placeholder}
                            autoFocus
                        />
                        {errors.nomor_identitas ? (
                            <p className="text-sm text-destructive">
                                {errors.nomor_identitas}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Pastikan nomor sesuai dengan yang tercatat saat pengajuan naskah.
                            </p>
                        )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={processing}>
                        {processing ? <Spinner /> : <Search />}
                        Telusuri
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                        Kesulitan menemukan data Anda? Hubungi admin penerbitan.
                    </p>
                </form>
            </div>
        </>
    );
}