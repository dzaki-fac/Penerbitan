<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('name', 'nama_lengkap');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('nickname')->nullable()->after('nama_lengkap');
        });

        $users = DB::table('users')->select('id', 'nama_lengkap')->get();

        foreach ($users as $user) {
            $nickname = trim((string) $user->nama_lengkap);

            if ($nickname !== '') {
                $nickname = preg_split('/\s+/', $nickname)[0];
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update(['nickname' => $nickname]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nickname');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('nama_lengkap', 'name');
        });
    }
};