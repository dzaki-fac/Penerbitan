<?php

namespace App\Enums;

enum IdentitasType: string
{
    case NIM = 'nim';
    case NIP = 'nip';

    public function label(): string
    {
        return match ($this) {
            self::NIM => 'NIM',
            self::NIP => 'NIP',
        };
    }
}
