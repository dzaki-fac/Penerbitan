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
        <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#FDFDFC]/90 backdrop-blur dark:border-neutral-800/70 dark:bg-[#0a0a0a]/90">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link href={tracking()} className="flex items-center gap-2">
                        <BookText className="size-6 text-primary" />
                        <span className="text-lg font-semibold tracking-tight">
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
                        ) : null}
                        <Button asChild variant="outline" size="sm">
                            <Link href="/login">Masuk Admin</Link>
                        </Button>
                    </nav>
                </div>
            </header>
            <main className={`mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 ${className}`}>
                {children}
            </main>
            <footer className="border-t border-neutral-200/70 py-6 dark:border-neutral-800/70">
                <div className="mx-auto w-full max-w-5xl px-4 text-center text-sm text-neutral-500 sm:px-6">
                    Sistem Monitoring &amp; Manajemen Proses Penerbitan
                </div>
            </footer>
        </div>
    );
}
