<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar ketika sebuah aksi workflow gagal karena status naskah
 * sudah diubah oleh pengguna lain (race condition). Diharapkan ditangani
 * oleh exception handler agar admin mendapat pesan yang jelas, bukan error mentah.
 */
class WorkflowConflictException extends RuntimeException
{
    public function __construct(string $message = 'Status naskah telah berubah oleh pengguna lain. Muat ulang halaman lalu coba lagi.')
    {
        parent::__construct($message);
    }
}
