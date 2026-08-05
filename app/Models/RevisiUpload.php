<?php

namespace App\Models;

use Database\Factories\RevisiUploadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Enums\RevisiJenis;

/**
 * @property int $id
 * @property int $naskah_id
 * @property int|null $author_id
 * @property RevisiJenis $jenis
 * @property string $file_path
 * @property string|null $catatan_penulis
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['naskah_id', 'author_id', 'jenis', 'file_path', 'catatan_penulis'])]
class RevisiUpload extends Model
{
    /** @use HasFactory<RevisiUploadFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenis' => RevisiJenis::class,
        ];
    }

    /**
     * @return BelongsTo<Naskah, $this>
     */
    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class);
    }

    /**
     * @return BelongsTo<Author, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
