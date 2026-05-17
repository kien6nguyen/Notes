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
Route::get('/reverb-log', function () {
    $path = storage_path('logs/reverb.log');
    if (!file_exists($path)) {
        return response()->json(['status' => 'error', 'message' => 'Reverb log file does not exist yet.'], 404);
    }
    return response(file_get_contents($path), 200, ['Content-Type' => 'text/plain']);
});
Route::get('/test-reverb', function () {
    $results = [];
    $hosts = ['127.0.0.1', 'localhost', '0.0.0.0', '::1'];
    foreach ($hosts as $host) {
        $fp = @fsockopen($host, 8085, $errno, $errstr, 2);
        if ($fp) {
            $results[$host] = 'SUCCESS (Connected)';
            fclose($fp);
        } else {
            $results[$host] = "FAILED: $errstr ($errno)";
        }
    }
    return response()->json($results);
});
