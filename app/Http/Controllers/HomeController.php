<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Menampilkan halaman beranda (landing page).
     */
    public function index(): Response
    {
        return Inertia::render('landing/index');
    }
}