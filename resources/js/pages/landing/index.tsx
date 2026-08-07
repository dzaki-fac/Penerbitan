import { Head, Link } from '@inertiajs/react';
import { BookOpenText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tracking } from '@/routes';

export default function Landing() {
    return (
        <>
            <Head title="Beranda" />

            <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6 text-foreground md:p-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="mb-1 flex items-center justify-center gap-4 rounded-md">
                        <img
                            src="/assets/logo_undip.png"
                            alt="Logo UNDIP"
                            className="h-24 w-auto"
                        />
                        <img
                            src="/images/logo-upt.png"
                            alt="Logo UPT Penerbitan"
                            className="h-24 w-auto"
                        />
                    </div>
                    <h1 className="text-center text-2xl font-semibold tracking-[0.016em] sm:text-3xl">
                        Sistem Monitoring &amp; Manajemen Penerbitan
                    </h1>
                    <p className="mx-auto max-w-xl text-center text-balance text-muted-foreground">
                        Pantau proses penerbitan naskah Anda atau ajukan naskah baru untuk diterbitkan.
                    </p>
                </div>

                <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <BookOpenText />
                        Ajukan Naskah Baru
                    </Button>
                    <Button asChild size="lg" className="gap-2">
                        <Link href={tracking()}>
                            <Search />
                            Lacak Proses Naskah
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}