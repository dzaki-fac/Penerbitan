import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { home } from '@/routes';

export default function TrackingLayout({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { auth, component } = usePage().props as unknown as {
        auth: { user: { nama_lengkap: string } | null };
    } & { component?: string };

    // Halaman form pencarian (foto + card besar) render header & bg sendiri —
    // jangan dobelin dengan header bar layout ini.
    const currentComponent = usePage().component;
    const hideHeader = currentComponent === 'tracking/index';

    if (hideHeader) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <main className={`flex-1 ${className}`}>{children}</main>
                {!auth.user && <WhatsAppButton />}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
                    <Link
                        href={home()}
                        className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2.5"
                    >
                        <AppLogo size="sm" showName={false} className="shrink-0" />
                    </Link>
                    <nav className="flex shrink-0 items-center gap-2">
                        {auth.user && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
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
            {!auth.user && <WhatsAppButton />}
        </div>
    );
}