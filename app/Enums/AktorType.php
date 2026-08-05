<?php

namespace App\Enums;

enum AktorType: string
{
    case Admin = 'admin';
    case Penulis = 'penulis';
    case Sistem = 'sistem';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Penulis => 'Penulis',
            self::Sistem => 'Sistem',
        };
    }
}
