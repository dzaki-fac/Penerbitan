/**
 * Helper untuk generate URL asset yang aware subfolder.
 * 
 * Masalah: src="/assets/logo.png" akan request ke http://localhost/assets/...
 * padahal app jalan di http://localhost/Penerbitan/ -> 404
 * 
 * Solusi: prefix dengan BASE_URL dari Vite (di-set via vite.config.ts)
 * atau fallback ke APP_URL subfolder (/penerbitan/).
 */
export function asset(path: string): string {
    const clean = path.replace(/^\/+/, '');

    // 1. Prioritas: Vite base URL (di-set di vite.config.ts -> import.meta.env.BASE_URL)
    // Saat build, Vite akan inject BASE_URL sesuai base config.
    const viteBase: string | undefined = import.meta.env.BASE_URL;
    if (viteBase && viteBase !== '/' && viteBase !== './') {
        return `${viteBase}${clean}`;
    }

    // 2. Fallback: deteksi subfolder dari window.location saat runtime
    // Ini handle kasus Laragon http://localhost/Penerbitan dan http://10.137.153.7/penerbitan
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname.toLowerCase();
        // Jika URL mengandung /penerbitan, prefix asset dengan subfolder tersebut
        if (pathname.startsWith('/penerbitan/') || pathname === '/penerbitan' || pathname.startsWith('/penerbitan')) {
            return `/penerbitan/${clean}`;
        }
    }

    // 3. Default: absolute root (untuk deploy di root domain)
    return `/${clean}`;
}
