import { Head, Link } from '@inertiajs/react';
import { BookOpenText, Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { tracking } from '@/routes';

export default function Landing() {
    return (
        <>
            <Head title="Beranda" />

            <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6 text-foreground md:p-10">
                <div className="flex flex-col items-center gap-4">
                    <AppLogo
                        size="lg"
                        showName={false}
                        className="mb-1 rounded-md"
                    />
                    <h1 className="text-center text-2xl font-semibold tracking-[0.016em] sm:text-3xl">
                        Sistem Penerbitan UPT Perpustakaan dan UNDIP Press
                    </h1>
                    <p className="mx-auto max-w-xl text-center text-balance text-muted-foreground">
                        Pantau proses penerbitan naskah Anda atau ajukan naskah
                        baru untuk diterbitkan.
                    </p>
                </div>

                <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="gap-2"
                        asChild
                    >
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLScioScW9vQOXXFCuHEaQNIg0cx3usvWyOXTf_9SQzKnMlbdjA/viewform"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <BookOpenText />
                            Ajukan Naskah Baru
                        </a>
                    </Button>
                    <Button asChild size="lg" className="gap-2">
                        <Link href={tracking()}>
                            <Search />
                            Lacak Proses Naskah
                        </Link>
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Bersinergi, Inovasi, Literasi, Layanan Primer
                </p>
            </div>
        </>
    );
}
