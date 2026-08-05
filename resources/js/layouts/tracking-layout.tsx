import { Link, usePage } from '@inertiajs/react';
import { BookText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tracking } from '@/routes';

export default function TrackingLayout({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { auth } = usePage().props as { auth: { user: { name: string } | null } };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href={tracking()} className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <BookText className="size-5" />
                        </span>
                        <span className="text-lg font-semibold tracking-[0.004em]">
                            Sistem Penerbitan
                        </span>
                    </Link>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin">
                                    <ShieldCheck />
                                    Admin
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/login">Masuk Admin</Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>
            <main className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 ${className}`}>
                {children}
            </main>
            <footer className="border-t border-border py-6">
                <div className="mx-auto w-full max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6">
                    Sistem Monitoring &amp; Manajemen Proses Penerbitan
                </div>
            </footer>
        </div>
    );
}
