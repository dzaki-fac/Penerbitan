<?php

namespace App\Enums;

enum IsbnStatus: string
{
    case Proses = 'proses';
    case Revisi = 'revisi';
    case Terbit = 'terbit';

    public function label(): string
    {
        return match ($this) {
            self::Proses => 'Proses',
            self::Revisi => 'Revisi',
            self::Terbit => 'Terbit',
        };
    }
}
