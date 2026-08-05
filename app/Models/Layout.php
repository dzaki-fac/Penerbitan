<?php

namespace App\Models;

use Database\Factories\LayoutFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Enums\LayoutStatus;

/**
 * @property int $id
 * @property int $naskah_id
 * @property int $versi
 * @property string|null $file_layout
 * @property string|null $preview_pdf_link
 * @property LayoutStatus $status
 * @property string|null $catatan_revisi
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['naskah_id', 'versi', 'file_layout', 'preview_pdf_link', 'status', 'catatan_revisi'])]
class Layout extends Model
{
    /** @use HasFactory<LayoutFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => LayoutStatus::class,
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
