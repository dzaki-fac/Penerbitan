<?php

namespace App\Enums;

enum IsbnStatus: string
{
    case Proses = 'proses';
    case MenungguPersetujuan = 'menunggu_persetujuan';
    case Disetujui = 'disetujui';
    case Revisi = 'revisi';

    public function label(): string
    {
        return match ($this) {
            self::Proses => 'Proses',
            self::MenungguPersetujuan => 'Menunggu Persetujuan',
            self::Disetujui => 'Disetujui',
            self::Revisi => 'Revisi',
        };
    }
}
