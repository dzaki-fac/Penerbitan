<?php

namespace App\Models;

use App\Enums\NaskahStatus;
use Database\Factories\NaskahFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $author_id
 * @property string $judul
 * @property string|null $link_cover
 * @property Carbon $tanggal_pengajuan
 * @property string|null $sumber_form
 * @property string|null $kebijakan_akses
 * @property string|null $biaya
 * @property string|null $nama_narahubung
 * @property string|null $nomor_whatsapp_narahubung
 * @property string|null $email_narahubung
 * @property string|null $link_dummy_upload
 * @property string|null $link_dummy_pdf
 * @property string|null $link_dummy_word
 * @property string|null $link_surat_keaslian
 * @property string|null $link_surat_penerbitan
 * @property NaskahStatus $status
 * @property int $progress
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['author_id', 'judul', 'link_cover', 'tanggal_pengajuan', 'sumber_form', 'kebijakan_akses', 'biaya', 'nama_narahubung', 'nomor_whatsapp_narahubung', 'email_narahubung', 'link_dummy_upload', 'link_dummy_pdf', 'link_dummy_word', 'link_surat_keaslian', 'link_surat_penerbitan', 'status', 'progress'])]
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
            'tanggal_pengajuan' => 'datetime',
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

    /**
     * @return HasMany<NaskahCatatan, $this>
     */
    public function catatan(): HasMany
    {
        return $this->hasMany(NaskahCatatan::class)->oldest();
    }
}
