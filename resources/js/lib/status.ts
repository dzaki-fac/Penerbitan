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

type Tone = 'progress' | 'action' | 'revision' | 'done' | 'cancel';

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
    penulis_mundur: 'cancel',
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
    cancel: 'Penulis Mundur',
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
    cancel: {
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-700 border-red-200',
        active: 'bg-red-100 text-red-700',
        indicator: 'border-red-500 bg-red-100 text-red-700',
        content: 'border-2 border-red-400 bg-red-50',
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

/**
 * Warna isian bar progress mengikuti persentase penyelesaian:
 * <50% kuning (baru mulai), 50–74% biru, 75–99% indigo (mendekati selesai),
 * 100% hijau (selesai). Selalu solid satu warna per level, tidak "rainbow".
 */
export function progressBarClass(progress: number): string {
    if (progress >= 100) {
        return 'bg-green-500';
    }

    if (progress >= 75) {
        return 'bg-indigo-500';
    }

    if (progress >= 50) {
        return 'bg-cobalt-surface';
    }

    return 'bg-amber-500';
}

/** Warna tombol aksi "lanjut"/maju ke tahap berikutnya: hijau solid. */
export const ADVANCE_BUTTON_CLASS =
    'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/40';

/** Warna tombol aksi revisi: teks merah, border merah, latar putih. */
export const REVISION_BUTTON_CLASS =
    'border border-red-300 bg-background text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-600/40';

/** Warna tombol aksi penulis yang dipicu admin atas nama penulis (lanjut): outline hijau putus-putus. */
export const AUTHOR_ADVANCE_BUTTON_CLASS =
    'border-dashed border-green-300 bg-background text-green-700 hover:bg-green-50 hover:text-green-800';

/** Warna tombol aksi penulis yang dipicu admin atas nama penulis (revisi): outline merah putus-putus. */
export const AUTHOR_REVISION_BUTTON_CLASS =
    'border border-dashed border-red-300 bg-background text-red-700 hover:bg-red-50 hover:text-red-800';

/**
 * Kelas tombol transisi berdasarkan status tujuan:
 * status revisi → merah, selain itu (lanjut) → hijau.
 */
export function transitionButtonClass(targetStatus: string): string {
    return REVISION_STATUS_VALUES.includes(targetStatus)
        ? REVISION_BUTTON_CLASS
        : ADVANCE_BUTTON_CLASS;
}

/** Kelas kotak "sudah selesai" pada timeline: selalu hijau, terlepas dari tone naskah saat ini. */
export const DONE_STEP_INDICATOR_CLASS =
    'border-green-300 bg-green-50 text-green-700';

/** Kelas garis penghubung timeline untuk step yang sudah selesai: hijau. */
export const DONE_STEP_CONNECTOR_CLASS = 'bg-green-400/60';

/** Kelas kotak catatan/informasi netral (bukan biru/lavender) supaya warna tidak monoton. */
export const NOTE_BOX_CLASS = 'border-border bg-muted/70';

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