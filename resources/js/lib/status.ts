/**
 * Key harus sama dengan nilai enum NaskahStatus::value di app/Enums/NaskahStatus.php.
 */

/** Status revisi di semua tahapan yang bisa mengalami revisi. */
export const REVISION_STATUS_VALUES = [
    'revisi_dokumen',
    'revisi_editing_layout',
    'revisi_isbn',
    'revisi_proof_reading',
];

type Tone = 'progress' | 'action' | 'revision' | 'done';

const TONE_BY_STATUS: Record<string, Tone> = {
    data_diterima: 'progress',
    verifikasi_dokumen: 'progress',
    revisi_dokumen: 'revision',
    dalam_proses_editing_layout: 'progress',
    revisi_editing_layout: 'revision',
    pengajuan_isbn: 'progress',
    revisi_isbn: 'revision',
    isbn_terbit: 'done',
    proof_reading_penulis: 'action',
    revisi_proof_reading: 'revision',
    acc_proof_reading: 'done',
    proses_cetak: 'progress',
    siap_diambil: 'action',
    selesai: 'done',
    menunggu_review: 'progress',
    disetujui: 'done',
    proses: 'progress',
    revisi: 'revision',
    terbit: 'done',
};

const LABEL_BY_TONE: Record<Tone, string> = {
    progress: 'Sedang diproses',
    action: 'Perlu tindakan Anda',
    revision: 'Perlu revisi',
    done: 'Selesai',
};

/**
 * Badge pendek untuk status turunan yang ditampilkan di dalam tahapan utama pada timeline.
 * Label ditampilkan netral tanpa warna status.
 */
const SUB_BADGE_BY_STATUS: Record<string, { label: string; tone: Tone }> = {
    revisi_dokumen: { label: 'Revisi', tone: 'revision' },
    revisi_editing_layout: { label: 'Revisi', tone: 'revision' },
    revisi_isbn: { label: 'Revisi', tone: 'revision' },
    isbn_terbit: { label: 'Terbit', tone: 'done' },
    revisi_proof_reading: { label: 'Revisi', tone: 'revision' },
    acc_proof_reading: { label: 'Acc', tone: 'done' },
};

function toneFor(statusValue: string): Tone {
    return TONE_BY_STATUS[statusValue] ?? 'progress';
}

/**
 * Palet warna per tone.
 * Revisi = merah, Selesai/Acc/Terbit = hijau, Perlu tindakan = kuning,
 * Sedang diproses = netral (primary). Sesuai arahan revisi UI/UX:
 * "kalau revisi di warna merah, kalau acc ijo".
 */
const TONE_COLORS: Record<
    Tone,
    {
        border: string;
        badge: string;
        active: string;
        indicator: string;
        content: string;
    }
> = {
    progress: {
        border: 'border-border',
        badge: 'bg-secondary text-secondary-foreground border-transparent',
        active: 'bg-primary/10 text-primary',
        indicator: 'border-primary bg-primary/10 text-primary',
        content: 'border-2 border-primary bg-primary/5',
    },
    action: {
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        active: 'bg-amber-100 text-amber-800',
        indicator: 'border-amber-500 bg-amber-100 text-amber-700',
        content: 'border-2 border-amber-400 bg-amber-50',
    },
    revision: {
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-700 border-red-200',
        active: 'bg-red-100 text-red-700',
        indicator: 'border-red-500 bg-red-100 text-red-700',
        content: 'border-2 border-red-400 bg-red-50',
    },
    done: {
        border: 'border-green-300',
        badge: 'bg-green-100 text-green-800 border-green-200',
        active: 'bg-green-100 text-green-800',
        indicator: 'border-green-500 bg-green-100 text-green-700',
        content: 'border-2 border-green-400 bg-green-50',
    },
};

/** Kelas warna border kartu, mengikuti tone status (revisi merah, acc/selesai hijau, dll). */
export function statusBorderClass(statusValue: string): string {
    return TONE_COLORS[toneFor(statusValue)].border;
}

/** Class Tailwind untuk badge status, mengikuti tone status. */
export function statusBadgeClass(statusValue: string): string {
    return TONE_COLORS[toneFor(statusValue)].badge;
}

/** Kelas badge untuk status aktif saat ini, mengikuti tone status. */
export function activeStatusClass(statusValue: string): string {
    return TONE_COLORS[toneFor(statusValue)].active;
}

/** Label untuk badge status aktif saat ini. */
export function activeStatusLabel(statusValue: string): string {
    return LABEL_BY_TONE[toneFor(statusValue)];
}

/** Kelas indikator lingkaran pada step aktif timeline, mengikuti tone status. */
export function activeIndicatorClass(statusValue: string): string {
    return TONE_COLORS[toneFor(statusValue)].indicator;
}

/** Kelas kartu konten step aktif: border tebal + bg, mengikuti tone status. */
export function activeContentClass(statusValue: string): string {
    return TONE_COLORS[toneFor(statusValue)].content;
}

/** True kalau status ini butuh tindakan dari penulis, termasuk status revisi */
export function needsAuthorAction(statusValue: string): boolean {
    return (
        toneFor(statusValue) === 'action' ||
        REVISION_STATUS_VALUES.includes(statusValue)
    );
}

/** True kalau status ini berarti ada revisi yang perlu diperbaiki */
export function isRevision(statusValue: string): boolean {
    return toneFor(statusValue) === 'revision';
}

/** True kalau naskah sudah selesai seluruh proses */
export function isDone(statusValue: string): boolean {
    return toneFor(statusValue) === 'done';
}

/** Label pendek untuk dipakai di indikator visual (bukan pengganti status.label dari server) */
export function statusToneLabel(statusValue: string): string {
    return LABEL_BY_TONE[toneFor(statusValue)];
}

/**
 * Badge tambahan untuk status turunan (Revisi/Terbit/Acc).
 * Kembalikan null jika status adalah tahapan utama.
 * Warna mengikuti tone status (Revisi = merah, Terbit/Acc = hijau).
 */
export function statusSubBadge(
    statusValue: string,
): { label: string; className: string } | null {
    const sub = SUB_BADGE_BY_STATUS[statusValue];

    if (!sub) {
        return null;
    }

    return {
        label: sub.label,
        className: TONE_COLORS[sub.tone].badge,
    };
}