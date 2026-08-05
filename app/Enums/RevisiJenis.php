<?php

namespace App\Enums;

enum RevisiJenis: string
{
    case Dokumen = 'dokumen';
    case Naskah = 'naskah';
    case Layout = 'layout';

    public function label(): string
    {
        return match ($this) {
            self::Dokumen => 'Dokumen',
            self::Naskah => 'Naskah',
            self::Layout => 'Layout',
        };
    }
}
