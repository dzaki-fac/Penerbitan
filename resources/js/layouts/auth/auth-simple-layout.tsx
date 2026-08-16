import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { tracking } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const BG_IMAGE_URL =
    'https://fisika.fsm.undip.ac.id/v2/wp-content/uploads/2025/10/perpus.jpg';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
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
                        <Link href={tracking()} className="mb-5">
                            <AppLogo size="md" showName={false} />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <h1
                            className="text-2xl font-semibold tracking-[0.016em] text-slate-900"
                            style={{ fontFamily: "'Source Serif 4', serif" }}
                        >
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-slate-600">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="mt-7">{children}</div>
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