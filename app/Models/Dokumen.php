<?php

namespace App\Models;

use Database\Factories\DokumenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Enums\DokumenStatus;

/**
 * @property int $id
 * @property int $naskah_id
 * @property string $nama_dokumen
 * @property string|null $file_path
 * @property DokumenStatus $status
 * @property string|null $catatan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['naskah_id', 'nama_dokumen', 'file_path', 'status', 'catatan'])]
class Dokumen extends Model
{
    /** @use HasFactory<DokumenFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => DokumenStatus::class,
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
