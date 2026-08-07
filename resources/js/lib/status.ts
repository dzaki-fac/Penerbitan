/**
 * PENTING: sesuaikan key di TONE_BY_STATUS ini dengan nilai asli
 * dari enum NaskahStatus::value di app/Enums/NaskahStatus.php.
 * Key di bawah adalah asumsi format snake_case standar Laravel.
 */

type Tone = 'progress' | 'action' | 'revision' | 'done';

const TONE_BY_STATUS: Record<string, Tone> = {
    data_diterima: 'progress',
    verifikasi_dokumen: 'progress',
    menunggu_perbaikan_dokumen: 'action',
    dalam_proses_editing_layout: 'progress',
    menunggu_review_editing_layout: 'action',
    revisi_editing_layout: 'revision',
    pengajuan_isbn: 'progress',
    menunggu_persetujuan_isbn: 'action',
    revisi_isbn: 'revision',
    finalisasi: 'progress',
    masuk_cetak: 'progress',
    siap_diambil: 'action',
    buku_diambil: 'done',
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

function toneFor(statusValue: string): Tone {
    return TONE_BY_STATUS[statusValue] ?? 'progress';
}

/** Class Tailwind untuk badge status, dipakai bareng <Badge className={...}> */
export function statusBadgeClass(statusValue: string): string {
    return CLASS_BY_TONE[toneFor(statusValue)];
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