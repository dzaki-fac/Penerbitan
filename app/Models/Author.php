<?php

namespace App\Models;

use Database\Factories\AuthorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use App\Enums\IdentitasType;

/**
 * @property int $id
 * @property string $nama
 * @property IdentitasType $jenis_identitas
 * @property string $nomor_identitas
 * @property string|null $email
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nama', 'jenis_identitas', 'nomor_identitas', 'email'])]
class Author extends Model
{
    /** @use HasFactory<AuthorFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenis_identitas' => IdentitasType::class,
        ];
    }

    /**
     * @return HasMany<Naskah, $this>
     */
    public function naskahs(): HasMany
    {
        return $this->hasMany(Naskah::class);
    }
}
