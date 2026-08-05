<?php

namespace App\Models;

use Database\Factories\WorkflowHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Enums\AktorType;
use App\Enums\NaskahStatus;

/**
 * @property int $id
 * @property int $naskah_id
 * @property NaskahStatus|null $dari_status
 * @property NaskahStatus $ke_status
 * @property AktorType $aktor
 * @property int|null $admin_id
 * @property string|null $catatan
 * @property Carbon $created_at
 */
#[Fillable(['naskah_id', 'dari_status', 'ke_status', 'aktor', 'admin_id', 'catatan'])]
class WorkflowHistory extends Model
{
    /** @use HasFactory<WorkflowHistoryFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dari_status' => NaskahStatus::class,
            'ke_status' => NaskahStatus::class,
            'aktor' => AktorType::class,
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
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
