<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AkunStoreRequest;
use App\Http\Requests\Admin\AkunUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AkunController extends Controller
{
    /**
     * Menampilkan daftar akun admin.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'nama_lengkap' => $user->nama_lengkap,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'verified' => $user->email_verified_at !== null,
                'created_at' => $user->created_at->format('d M Y'),
            ]);

        return Inertia::render('admin/akun/index', [
            'users' => $users,
            'currentUserId' => $request->user()->id,
        ]);
    }

    /**
     * Membuat akun admin baru (tidak bisa dilakukan oleh yang bersangkutan).
     */
    public function store(AkunStoreRequest $request): RedirectResponse
    {
        User::create([
            'nama_lengkap' => $request->validated('nama_lengkap'),
            'nickname' => $request->validated('nickname'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'email_verified_at' => now(),
        ]);

        flashSuccess(__('Akun admin berhasil dibuat.'));

        return back();
    }

    /**
     * Memperbarui data akun admin.
     */
    public function update(User $akun, AkunUpdateRequest $request): RedirectResponse
    {
        $akun->fill($request->safe()->except(['password']));

        if ($password = $request->validated('password')) {
            $akun->password = $password;
        }

        $akun->email_verified_at ??= now();
        $akun->save();

        flashSuccess(__('Akun admin berhasil diperbarui.'));

        return back();
    }

    /**
     * Menghapus akun admin.
     */
    public function destroy(Request $request, User $akun): RedirectResponse
    {
        if ($akun->id === $request->user()->id) {
            flashError(__('Akun yang sedang digunakan tidak dapat dihapus.'));

            return back();
        }

        $isLastAdmin = User::whereKeyNot($akun->getKey())->doesntExist();

        if ($isLastAdmin) {
            flashError(__('Akun admin terakhir tidak dapat dihapus.'));

            return back();
        }

        $akun->delete();

        flashSuccess(__('Akun admin berhasil dihapus.'));

        return back();
    }
}
