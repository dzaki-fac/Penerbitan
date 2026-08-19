export type StatusBadge = {
    value: string;
    label: string;
};

export type WorkflowStep = {
    value: string;
    label: string;
    progress: number;
    stage: number;
};

export type NaskahStatusInfo = StatusBadge & {
    stage: number;
};

export type AuthorCard = {
    nama: string;
    jenis_identitas: string;
    nomor_identitas: string;
};

export type AuthorDetail = AuthorCard & {
    id?: number;
    email?: string | null;
    status?: string | null;
    fakultas_sekolah?: string | null;
    nomor_npwp?: string | null;
    nomor_whatsapp?: string | null;
    penulis_tambahan?: string | null;
};

export type NaskahCard = {
    id: number;
    judul: string;
    link_cover: string | null;
    status: StatusBadge;
    progress: number;
    tanggal_pengajuan: string;
    penulis?: string;
    identitas?: string;
    penulis_status?: string | null;
    fakultas_sekolah?: string | null;
};

export type NaskahDetail = {
    id: number;
    judul: string;
    link_cover: string | null;
    status: NaskahStatusInfo;
    progress: number;
    tanggal_pengajuan: string;
    sumber_form: string | null;
    kebijakan_akses: string | null;
    biaya: string | null;
    nama_narahubung: string | null;
    nomor_whatsapp_narahubung: string | null;
    email_narahubung: string | null;
    link_dummy_upload: string | null;
    link_dummy_pdf: string | null;
    link_dummy_word: string | null;
    link_surat_keaslian: string | null;
    link_surat_penerbitan: string | null;
    author: AuthorDetail;
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
        file_url: string | null;
    }>;
    histories: Array<{
        id: number;
        dari_status: NaskahStatusInfo | null;
        ke_status: NaskahStatusInfo;
        aktor: StatusBadge;
        admin: string | null;
        catatan: string | null;
        can_edit_catatan: boolean;
        waktu: string;
    }>;
    catatan: Array<{
        id: number;
        author_name: string;
        isi: string;
        target_type: string;
        target_value: string | null;
        waktu: string;
    }>;
};

export type TrackingAction =
    | { jenis: 'upload_revisi'; label: string }
    | { jenis: 'review'; label: string }
    | { jenis: 'diambil'; label: string }
    | null;
