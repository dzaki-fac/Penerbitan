import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function TrackingLayout({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { auth } = usePage().props as {
        auth: { user: { nama_lengkap: string } | null };
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
                    <Link
                        href={home()}
                        className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2.5"
                    >
                        <AppLogo size="sm" showName={false} className="shrink-0" />
                        <span className="truncate text-sm font-semibold tracking-[0.004em] sm:text-lg">
                            <span className="sm:hidden">Penerbitan</span>
                            <span className="hidden sm:inline">
                                Sistem Penerbitan
                            </span>
                        </span>
                    </Link>
                    <nav className="flex shrink-0 items-center gap-2">
                        {auth.user && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin">
                                    <ShieldCheck />
                                    <span className="hidden xs:inline">Admin</span>
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>
            <main
                className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 ${className}`}
            >
                {children}
            </main>
        </div>
    );
}