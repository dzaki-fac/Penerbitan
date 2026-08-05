<?php

namespace Database\Factories;

use App\Enums\AktorType;
use App\Enums\NaskahStatus;
use App\Models\Naskah;
use App\Models\WorkflowHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkflowHistory>
 */
class WorkflowHistoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naskah_id' => Naskah::factory(),
            'dari_status' => NaskahStatus::DataDiterima,
            'ke_status' => NaskahStatus::VerifikasiDokumen,
            'aktor' => AktorType::Admin,
            'admin_id' => null,
            'catatan' => null,
        ];
    }
}
