<?php

namespace App\Models;

use Database\Factories\IsbnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Enums\IsbnStatus;

/**
 * @property int $id
 * @property int $naskah_id
 * @property string|null $nomor_isbn
 * @property string|null $penerbit
 * @property IsbnStatus $status
 * @property string|null $catatan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['naskah_id', 'nomor_isbn', 'penerbit', 'status', 'catatan'])]
class Isbn extends Model
{
    /** @use HasFactory<IsbnFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => IsbnStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Naskah, $this>
     */
    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class);
    }
}
