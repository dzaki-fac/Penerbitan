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
