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
    revisi_dokumen: 'action',
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
};

const CLASS_BY_TONE: Record<Tone, string> = {
    progress: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
    action: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
    revision: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
    done: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
};

const LABEL_BY_TONE: Record<Tone, string> = {
    progress: 'Sedang diproses',
    action: 'Perlu tindakan Anda',
    revision: 'Perlu revisi',
    done: 'Selesai',
};

/**
 * Badge pendek untuk status turunan yang ditampilkan di dalam tahapan utama pada timeline.
 * revisi => merah, terbit/acc => hijau.
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

/** Class Tailwind untuk badge status, dipakai bareng <Badge className={...}> */
export function statusBadgeClass(statusValue: string): string {
    return CLASS_BY_TONE[toneFor(statusValue)];
}

/** Kelas badge untuk status aktif saat ini (Sedang berjalan / Menunggu penulis / Perlu revisi). */
export function activeStatusClass(statusValue: string): string {
    switch (toneFor(statusValue)) {
        case 'action':
            return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'revision':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-primary/10 text-primary';
    }
}

/** Label untuk badge status aktif saat ini. */
export function activeStatusLabel(statusValue: string): string {
    switch (toneFor(statusValue)) {
        case 'action':
            return 'Menunggu penulis';
        case 'revision':
            return 'Perlu revisi';
        default:
            return 'Sedang berjalan';
    }
}

/** Kelas indikator lingkaran pada step aktif timeline (warna mengikuti keadaan status). */
export function activeIndicatorClass(statusValue: string): string {
    switch (toneFor(statusValue)) {
        case 'action':
            return 'border-amber-400 bg-amber-100 text-amber-800';
        case 'revision':
            return 'border-red-400 bg-red-100 text-red-700';
        default:
            return 'border-primary bg-primary/10 text-primary';
    }
}

/** Kelas isian bar progress aktif; warna + border mengikuti keadaan status. */
export function activeProgressClass(statusValue: string): string {
    switch (toneFor(statusValue)) {
        case 'action':
            return 'border-amber-600 bg-amber-500';
        case 'revision':
            return 'border-red-600 bg-red-500';
        default:
            return 'border-primary-foreground/20 bg-primary';
    }
}

/** Kelas kartu konten step aktif: border tebal + bg warna mengikuti keadaan status. */
export function activeContentClass(statusValue: string): string {
    switch (toneFor(statusValue)) {
        case 'action':
            return 'border-2 border-amber-400 bg-amber-50';
        case 'revision':
            return 'border-2 border-red-400 bg-red-50';
        default:
            return 'border-2 border-primary bg-primary/5';
    }
}

/** True kalau status ini butuh tindakan dari penulis */
export function needsAuthorAction(statusValue: string): boolean {
    return toneFor(statusValue) === 'action';
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
 */
export function statusSubBadge(
    statusValue: string,
): { label: string; className: string } | null {
    const sub = SUB_BADGE_BY_STATUS[statusValue];

    if (!sub) {
        return null;
    }

    return { label: sub.label, className: CLASS_BY_TONE[sub.tone] };
}
