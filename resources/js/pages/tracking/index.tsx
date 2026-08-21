import { Head, Link, useForm } from '@inertiajs/react';
import { Phone, Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home } from '@/routes';
import { search } from '@/routes/tracking';

const METODE = [
    { key: 'nim', label: 'NIM', keterangan: 'Untuk mahasiswa.' },
    { key: 'nip', label: 'NIP', keterangan: 'Untuk dosen dan staf.' },
    { key: 'email', label: 'Email', keterangan: 'Jika Anda lupa NIM/NIP.' },
] as const;

const BG_IMAGE_URL =
    'https://fisika.fsm.undip.ac.id/v2/wp-content/uploads/2025/10/perpus.jpg';

export default function TrackingIndex() {
    const { data, setData, post, errors, processing } = useForm({
        jenis_identitas: 'nim' as 'nim' | 'nip' | 'email',
        nomor_identitas: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(search.url());
    }

    const activeMetode = METODE.find((m) => m.key === data.jenis_identitas)!;

    const placeholder =
        data.jenis_identitas === 'email'
            ? 'Contoh: penulis@email.com'
            : data.jenis_identitas === 'nip'
              ? 'Contoh: 19860926xxxxxxxxxx'
              : 'Contoh: 2406012412xxxx';

    return (
        <>
            <Head title="Tracking Naskah">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative flex min-h-svh items-center justify-center px-4 py-14 sm:py-20">
                <div
                    aria-hidden
                    className="fixed inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
                />
                <div
                    aria-hidden
                    className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]"
                />

                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                    <div className="text-center">
                        <Link
                            href={home()}
                            className="inline-flex justify-center"
                        >
                            <AppLogo
                                size="md"
                                showName={false}
                                className="mb-6 justify-center transition-opacity hover:opacity-80"
                            />
                        </Link>
                        <h1
                            className="text-2xl font-semibold tracking-[0.016em] text-slate-900 sm:text-3xl"
                            style={{ fontFamily: "'Source Serif 4', serif" }}
                        >
                            Lacak Naskah Anda
                        </h1>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="jenis_identitas" className="text-slate-800">
                                Cari Berdasarkan
                            </Label>
                            <div className="inline-flex w-full rounded-lg bg-slate-100 p-1">
                                {METODE.map(({ key, label }) => {
                                    const active =
                                        data.jenis_identitas === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() =>
                                                setData('jenis_identitas', key)
                                            }
                                            aria-pressed={active}
                                            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                                active
                                                    ? 'bg-white text-[#1B3A6B] shadow-sm'
                                                    : 'text-slate-500 hover:text-[#1B3A6B]'
                                            }`}
                                                                                    >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-slate-500">
                                {activeMetode.keterangan}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nomor_identitas" className="text-slate-800">
                                {data.jenis_identitas === 'email'
                                    ? 'Alamat Email'
                                    : 'Nomor Identitas'}
                            </Label>
                            <Input
                                id="nomor_identitas"
                                type={
                                    data.jenis_identitas === 'email'
                                        ? 'email'
                                        : 'text'
                                }
                                value={data.nomor_identitas}
                                onChange={(e) =>
                                    setData('nomor_identitas', e.target.value)
                                }
                                placeholder={placeholder}
                                autoFocus
                                className="bg-white focus-visible:ring-[#1B3A6B]/40"
                            />
                            {errors.nomor_identitas && (
                                <p className="text-sm text-destructive">
                                    {errors.nomor_identitas}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full justify-center gap-2 border border-[#1B3A6B]/30 bg-white text-[#1B3A6B] shadow-none hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white active:border-[#1B3A6B] active:bg-[#1B3A6B] active:text-white"
                            disabled={processing}
                        >
                            {processing ? <Spinner /> : <Search size={18} />}
                            Telusuri
                        </Button>

                        <div className="text-center">
                            <p className="text-xs text-slate-500">
                                Kesulitan menemukan data Anda? 
                                Silahkan hubungi admin penerbitan.
                            </p>
                            <a
                                href="tel:+6281326627285"
                                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3A6B] hover:text-[#0f2547]"
                            >
                                <Phone className="size-3.5" />
                                0813-2662-7285
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// Opt this page out of any global default layout (some app.tsx setups
// auto-wrap every page unless `.layout` is explicitly set).
TrackingIndex.layout = (page: React.ReactNode) => page;