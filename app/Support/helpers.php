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
