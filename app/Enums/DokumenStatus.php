<?php

namespace App\Enums;

enum DokumenStatus: string
{
    case Belum = 'belum';
    case Lengkap = 'lengkap';
    case PerluPerbaikan = 'perlu_perbaikan';

    public function label(): string
    {
        return match ($this) {
            self::Belum => 'Belum',
            self::Lengkap => 'Lengkap',
            self::PerluPerbaikan => 'Perlu Perbaikan',
        };
    }
}
