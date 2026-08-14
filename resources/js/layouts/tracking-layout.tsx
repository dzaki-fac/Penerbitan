import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
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
    const { auth } = usePage().props as {
        auth: { user: { name: string } | null };
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href={home()} className="flex items-center gap-2.5">
                        <img
                            src="/assets/logo_undip.png"
                            alt=""
                            className="h-11 w-auto"
                        />
                        <img
                            src="/images/logo-upt.png"
                            alt=""
                            className="h-11 w-auto"
                        />
                        <span className="text-lg font-semibold tracking-[0.004em]">
                            Sistem Penerbitan
                        </span>
                    </Link>
                    <nav className="flex items-center gap-2">
                        {auth.user && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin">
                                    <ShieldCheck />
                                    Admin
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
