<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\ShareController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Broadcasting auth (must use Sanctum)
Illuminate\Support\Facades\Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::middleware('verified')->group(function () {
        Route::post('/notes/upload-attachment', [NoteController::class, 'uploadAttachment']);
        Route::apiResource('notes', NoteController::class);
        Route::apiResource('labels', LabelController::class)->except(['show']);

        // Sharing
        Route::post('/notes/{note}/share', [ShareController::class, 'share']);
        Route::delete('/notes/{note}/share/{userId}', [ShareController::class, 'unshare']);
        Route::get('/notes/{note}/shares', [ShareController::class, 'getShares']);
        Route::get('/shared-notes', [ShareController::class, 'sharedWithMe']);

        // Unlock password-protected note
        Route::post('/notes/{note}/unlock', [ShareController::class, 'unlock']);

        // Change password on a locked note
        Route::post('/notes/{note}/change-password', [ShareController::class, 'changePassword']);

        // Real-time cursor broadcasting
        Route::post('/notes/{note}/cursor', [NoteController::class, 'broadcastCursor']);
    });
});
