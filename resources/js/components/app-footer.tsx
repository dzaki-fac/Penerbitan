import { Link } from '@inertiajs/react';
import { BookText } from 'lucide-react';
import { tracking } from '@/routes';

export default function AppFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookText className="size-4" />
                    <span>Sistem Monitoring &amp; Manajemen Proses Penerbitan</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href={tracking()} className="transition-colors hover:text-foreground">
                        Tracking Naskah
                    </Link>
                    <span aria-hidden="true">·</span>
                    <span>© {year} Penerbitan</span>
                </div>
            </div>
        </footer>
    );
}
