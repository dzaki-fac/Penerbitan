<?php

namespace App\Models;

use Database\Factories\NaskahFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use App\Enums\NaskahStatus;

/**
 * @property int $id
 * @property int $author_id
 * @property string $judul
 * @property string|null $abstrak
 * @property string|null $kategori
 * @property Carbon $tanggal_pengajuan
 * @property string|null $sumber_form
 * @property NaskahStatus $status
 * @property int $progress
 * @property string|null $link_drive
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['author_id', 'judul', 'abstrak', 'kategori', 'tanggal_pengajuan', 'sumber_form', 'status', 'progress', 'link_drive'])]
class Naskah extends Model
{
    /** @use HasFactory<NaskahFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => NaskahStatus::class,
            'tanggal_pengajuan' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Author, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * @return HasMany<WorkflowHistory, $this>
     */
    public function histories(): HasMany
    {
        return $this->hasMany(WorkflowHistory::class)->latest();
    }

    /**
     * @return HasOne<Layout, $this>
     */
    public function latestLayout(): HasOne
    {
        return $this->hasOne(Layout::class)->latestOfMany();
    }

    /**
     * @return HasMany<Layout, $this>
     */
    public function layouts(): HasMany
    {
        return $this->hasMany(Layout::class)->orderByDesc('versi');
    }

    /**
     * @return HasOne<Isbn, $this>
     */
    public function isbn(): HasOne
    {
        return $this->hasOne(Isbn::class);
    }

    /**
     * @return HasMany<RevisiUpload, $this>
     */
    public function revisiUploads(): HasMany
    {
        return $this->hasMany(RevisiUpload::class)->latest();
    }
}
