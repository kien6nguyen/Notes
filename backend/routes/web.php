<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-mail', function () {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test email from Notes App!', function ($message) {
            $message->to('nguyenlamkienmh2004@gmail.com') // also send to the user's email
                    ->subject('Test Mail');
        });
        return response()->json(['status' => 'success', 'message' => 'Email sent successfully!']);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

