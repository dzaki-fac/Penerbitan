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

/** Kelas warna border kartu; netral tidak mengikuti status. */
export function statusBorderClass(): string {
    return 'border-border';
}

/** Class Tailwind untuk badge status; netral tidak mengikuti status. */
export function statusBadgeClass(): string {
    return 'bg-secondary text-secondary-foreground border-transparent';
}

/** Kelas badge untuk status aktif saat ini; netral tidak mengikuti status. */
export function activeStatusClass(): string {
    return 'bg-primary/10 text-primary';
}

/** Label untuk badge status aktif saat ini. */
export function activeStatusLabel(): string {
    return 'Sedang berjalan';
}

/** Kelas indikator lingkaran pada step aktif timeline; netral tidak mengikuti status. */
export function activeIndicatorClass(): string {
    return 'border-primary bg-primary/10 text-primary';
}

/** Kelas kartu konten step aktif: border tebal + bg; netral tidak mengikuti status. */
export function activeContentClass(): string {
    return 'border-2 border-primary bg-primary/5';
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
 * Warna netral, tidak mengikuti status.
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
        className: 'bg-muted text-foreground border-border',
    };
}
