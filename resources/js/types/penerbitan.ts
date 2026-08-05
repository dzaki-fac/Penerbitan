export type StatusBadge = {
    value: string;
    label: string;
};

export type WorkflowStep = {
    value: string;
    label: string;
    progress: number;
};

export type AuthorCard = {
    nama: string;
    jenis_identitas: string;
    nomor_identitas: string;
};

export type NaskahCard = {
    id: number;
    judul: string;
    kategori: string | null;
    status: StatusBadge;
    progress: number;
    tanggal_pengajuan: string;
    penulis?: string;
    identitas?: string;
};

export type NaskahDetail = {
    id: number;
    judul: string;
    abstrak: string | null;
    kategori: string | null;
    status: StatusBadge;
    progress: number;
    tanggal_pengajuan: string;
    sumber_form: string | null;
    catatan_admin: string | null;
    author: AuthorCard & { id?: number; email?: string | null };
    dokumens: Array<{
        id: number;
        nama_dokumen: string;
        status: StatusBadge;
        catatan: string | null;
        file_url: string | null;
    }>;
    layout: {
        id: number;
        versi: number;
        preview_pdf_link: string | null;
        status: StatusBadge;
        catatan_revisi: string | null;
    } | null;
    layouts?: Array<{
        id: number;
        versi: number;
        file_url: string | null;
        preview_pdf_link: string | null;
        status: StatusBadge;
        catatan_revisi: string | null;
        tanggal: string;
    }>;
    isbn: {
        id: number;
        nomor_isbn: string | null;
        penerbit: string | null;
        status: StatusBadge;
        catatan: string | null;
    } | null;
    revisi_uploads: Array<{
        id: number;
        jenis: StatusBadge;
        catatan_penulis: string | null;
        tanggal: string;
        file_url: string;
    }>;
    histories: Array<{
        id: number;
        dari_status: StatusBadge | null;
        ke_status: StatusBadge;
        aktor: StatusBadge;
        admin: string | null;
        catatan: string | null;
        waktu: string;
    }>;
};

export type TrackingAction =
    | { jenis: 'upload_revisi'; label: string }
    | { jenis: 'review'; label: string }
    | { jenis: 'diambil'; label: string }
    | null;
