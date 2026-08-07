import { Head, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { search } from '@/routes/tracking';

export default function TrackingIndex() {
    const { data, setData, post, errors, processing } = useForm({
        jenis_identitas: 'nim',
        nomor_identitas: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(search.url());
    }

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
                        Masukkan NIM atau NIP untuk melihat seluruh naskah dan
                        perkembangan proses penerbitan Anda.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="mt-10 w-full max-w-lg space-y-6 rounded-xl border border-border bg-card p-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="jenis_identitas">Jenis Identitas</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['nim', 'nip'] as const).map((jenis) => (
                                <button
                                    key={jenis}
                                    type="button"
                                    onClick={() => setData('jenis_identitas', jenis)}
                                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                                        data.jenis_identitas === jenis
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
                            value={data.nomor_identitas}
                            onChange={(e) => setData('nomor_identitas', e.target.value)}
                            placeholder="Contoh: 21111000 atau 198501012010121001"
                            autoFocus
                        />
                        {errors.nomor_identitas && (
                            <p className="text-sm text-destructive">
                                {errors.nomor_identitas}
                            </p>
                        )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={processing}>
                        {processing ? <Spinner /> : <Search />}
                        Telusuri
                    </Button>
                </form>
            </div>
        </>
    );
}
