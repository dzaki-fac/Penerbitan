<?php

use Inertia\Inertia;

if (! function_exists('flashSuccess')) {
    /**
     * Mengirimkan pesan sukses ke UI melalui flash Inertia.
     */
    function flashSuccess(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }
}

if (! function_exists('flashError')) {
    /**
     * Mengirimkan pesan error ke UI melalui flash Inertia.
     */
    function flashError(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'error',
            'message' => $message,
        ]);
    }
}

if (! function_exists('initialsOf')) {
    /**
     * Membentuk inisial nama: huruf pertama dari setiap kata.
     *
     * Contoh: "Nadia Azura Nurhaniya" -> "NAN", "Budi Santoso" -> "BS".
     * Tahan terhadap spasi berlebih dan nama satu kata.
     */
    function initialsOf(string $name): string
    {
        $words = preg_split('/\s+/u', trim($name)) ?: [];

        $initials = '';

        foreach ($words as $word) {
            $initials .= mb_strtoupper(mb_substr($word, 0, 1));
        }

        return $initials;
    }
}

if (! function_exists('normalizeFakultasSekolah')) {
    /**
     * Merapikan nilai fakultas/sekolah agar konsisten saat disimpan.
     *
     * Menghapus spasi berlebih di awal/akhir dan antar kata, lalu menyamakan
     * penulisan (title case). Contoh: "  fakultas   teknik  " -> "Fakultas Teknik".
     */
    function normalizeFakultasSekolah(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = preg_replace('/\s+/u', ' ', trim($value)) ?: '';

        if ($trimmed === '') {
            return null;
        }

        if (mb_strtolower($trimmed, 'UTF-8') === 'belum terisi') {
            return null;
        }

        // Hilangkan singkatan di dalam kurung, mis. " (Fsm)".
        $base = preg_replace('/\s*\([^)]*\)\s*$/u', '', $trimmed);
        $base = preg_replace('/\s+/u', ' ', trim($base)) ?: '';

        $canonical = [
            'Fakultas Ekonomika dan Bisnis',
            'Fakultas Hukum',
            'Fakultas Ilmu Budaya',
            'Fakultas Ilmu Sosial dan Ilmu Politik',
            'Fakultas Kedokteran',
            'Fakultas Kesehatan Masyarakat',
            'Fakultas Perikanan dan Ilmu Kelautan',
            'Fakultas Peternakan dan Pertanian',
            'Fakultas Sains dan Matematika',
            'Fakultas Teknik',
            'Fakultas Psikologi',
            'Sekolah Pascasarjana',
            'Sekolah Vokasi',
            'Lainnya',
        ];

        foreach ($canonical as $option) {
            if (mb_strtolower($base, 'UTF-8') === mb_strtolower($option, 'UTF-8')) {
                return $option;
            }
        }

        // Bukan opsi baku: pertahankan nilai asli tanpa ubah kapitalisasi.
        return $trimmed;
    }
}
