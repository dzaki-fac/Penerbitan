<?php

namespace App\Enums;

enum LayoutStatus: string
{
    case MenungguReview = 'menunggu_review';
    case Disetujui = 'disetujui';
    case Revisi = 'revisi';

    public function label(): string
    {
        return match ($this) {
            self::MenungguReview => 'Menunggu Review',
            self::Disetujui => 'Disetujui',
            self::Revisi => 'Revisi',
        };
    }
}
