export type FakultasOption = {
    value: string;
    label: string;
};

export const FAKULTAS_OPTIONS: FakultasOption[] = [
    {
        value: 'Fakultas Ekonomika dan Bisnis',
        label: 'Fakultas Ekonomika dan Bisnis (FEB)',
    },
    { value: 'Fakultas Hukum', label: 'Fakultas Hukum (FH)' },
    { value: 'Fakultas Ilmu Budaya', label: 'Fakultas Ilmu Budaya (FIB)' },
    {
        value: 'Fakultas Ilmu Sosial dan Ilmu Politik',
        label: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    },
    { value: 'Fakultas Kedokteran', label: 'Fakultas Kedokteran (FK)' },
    {
        value: 'Fakultas Kesehatan Masyarakat',
        label: 'Fakultas Kesehatan Masyarakat (FKM)',
    },
    {
        value: 'Fakultas Perikanan dan Ilmu Kelautan',
        label: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    },
    {
        value: 'Fakultas Peternakan dan Pertanian',
        label: 'Fakultas Peternakan dan Pertanian (FPP)',
    },
    {
        value: 'Fakultas Sains dan Matematika',
        label: 'Fakultas Sains dan Matematika (FSM)',
    },
    { value: 'Fakultas Teknik', label: 'Fakultas Teknik (FT)' },
    { value: 'Fakultas Psikologi', label: 'Fakultas Psikologi' },
    { value: 'Sekolah Pascasarjana', label: 'Sekolah Pascasarjana' },
    { value: 'Sekolah Vokasi', label: 'Sekolah Vokasi' },
    { value: 'Lainnya', label: 'Lainnya' },
];

export function findFakultasOption(value: string): FakultasOption | undefined {
    return FAKULTAS_OPTIONS.find(
        (option) => option.value.toLowerCase() === value.trim().toLowerCase(),
    );
}
