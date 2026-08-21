import { Head, Link } from '@inertiajs/react';
import { FilePlus2, Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { tracking } from '@/routes';

const GFORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScioScW9vQOXXFCuHEaQNIg0cx3usvWyOXTf_9SQzKnMlbdjA/viewform';

const BG_IMAGE_URL =
    'https://fisika.fsm.Undip.ac.id/v2/wp-content/uploads/2025/10/perpus.jpg';

export default function Landing() {
    return (
        <>
            <Head title="Beranda">
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

            <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16">
                {/* Background photo */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
                />
                {/* Dark + blur overlay so the card stays readable */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
                />

                <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
                    <div className="flex flex-col items-center text-center">
                        <AppLogo size="md" showName={false} className="mb-5" />
                        <h1
                            className="text-2xl font-semibold tracking-[0.016em] text-slate-900"
                            style={{ fontFamily: "'Source Serif 4', serif" }}
                        >
                            Sistem Penerbitan
                        </h1>
                        <p className="mt-1 text-lg text-slate-600">
                            UPT Perpustakaan dan Undip Press
                        </p>
                    </div>

                    <div className="my-7 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="text-sm text-slate-400">
                            Pilih Layanan
                        </span>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="space-y-3">
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="w-full justify-center gap-2 border-[#1B3A6B]/30 bg-white text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white active:border-[#1B3A6B] active:bg-[#1B3A6B] active:text-white"
                        >
                            <a
                                href={GFORM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FilePlus2 size={18} />
                                Ajukan Naskah Baru
                            </a>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            className="w-full justify-center gap-2 border border-[#1B3A6B]/30 bg-white text-[#1B3A6B] shadow-none hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white active:border-[#1B3A6B] active:bg-[#1B3A6B] active:text-white"
                        >
                            <Link href={tracking()}>
                                <Search size={18} />
                                Lacak Proses Naskah
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-7 text-center text-xs text-slate-400">
                        Bersinergi, Inovasi, Literasi, Layanan Primer
                    </p>
                </div>

                <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70">
                    <span className="sm:hidden">© {new Date().getFullYear()} UPT Perpustakaan &amp; UNDIP Press</span>
                    <span className="hidden sm:inline">
                        © {new Date().getFullYear()} UPT Perpustakaan dan UNDIP Press, Universitas Diponegoro. Semua hak dilindungi.
                    </span>
                </p>
            </div>
        </>
    );
}