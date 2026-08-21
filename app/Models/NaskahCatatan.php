<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $naskah_id
 * @property string $author_name
 * @property string $isi
 * @property string $target_type
 * @property string|null $target_value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class NaskahCatatan extends Model
{
    /** @use HasFactory<\Database\Factories\NaskahCatatanFactory> */
    use HasFactory;

    protected $table = 'naskah_catatan';

    protected $fillable = [
        'naskah_id',
        'author_name',
        'isi',
        'target_type',
        'target_value',
    ];

    /**
     * @return BelongsTo<Naskah, $this>
     */
    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class);
    }
}
