<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'preferences' => [
                'theme' => 'light',
                'fontSize' => 'medium',
                'noteColor' => 'default'
            ]
        ]);

        // Generate 6-digit verification OTP
        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('email_verification_otp_' . $user->email, $otp, now()->addMinutes(15));
        \Illuminate\Support\Facades\Log::info("Email verification OTP for {$user->email}: {$otp}");

        // Send OTP via email
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your Notes App verification code is: {$otp}\n\nThis code expires in 15 minutes.\n\nIf you did not register, please ignore this email.",
                function ($message) use ($user, $otp) {
                    $message->to($user->email, $user->name)
                            ->subject('Your Notes App Verification Code: ' . $otp);
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to send OTP email to {$user->email}: " . $e->getMessage());
        }

        // Auto login with temporary access token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'requires_verification' => true
        ], 201);
    }

    public function login(Request $request)
    {
        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        $requiresVerification = is_null($user->email_verified_at);

        if ($requiresVerification) {
            // Generate a fresh OTP for resending
            $otp = rand(100000, 999999);
            \Illuminate\Support\Facades\Cache::put('email_verification_otp_' . $user->email, $otp, now()->addMinutes(15));
            \Illuminate\Support\Facades\Log::info("Login verification OTP for {$user->email}: {$otp}");

            // Send OTP via email
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Your Notes App verification code is: {$otp}\n\nThis code expires in 15 minutes.",
                    function ($message) use ($user, $otp) {
                        $message->to($user->email, $user->name)
                                ->subject('Your Notes App Verification Code: ' . $otp);
                    }
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Failed to send login OTP email: " . $e->getMessage());
            }
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'requires_verification' => $requiresVerification
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'preferences' => 'nullable', // Could be JSON string or array
            'currentPassword' => 'nullable|string',
            'newPassword' => 'nullable|string|min:6',
            'avatar' => 'nullable|image|max:2048', // Max 2MB image
        ]);

        if (!empty($validated['newPassword'])) {
            if (!$request->has('currentPassword') || !Hash::check($validated['currentPassword'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 400);
            }
            $user->password = Hash::make($validated['newPassword']);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Handle preferences which might be sent as a string via FormData
        if ($request->has('preferences')) {
            $prefs = $validated['preferences'];
            if (is_string($prefs)) {
                $prefs = json_decode($prefs, true);
            }
            $user->preferences = $prefs;
        }

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/' . $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => clone $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = rand(100000, 999999);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($otp), 'created_at' => now()]
        );

        // In a real app, send this via email. We're using log for testing.
        \Illuminate\Support\Facades\Log::info("Password reset OTP for {$request->email}: {$otp}");

        return response()->json(['message' => 'OTP sent to your email. Check laravel.log if MAIL_MAILER=log']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $user = App\Models\User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6'
        ]);

        $user = $request->user();
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('email_verification_otp_' . $user->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Invalid or expired activation OTP code'], 400);
        }

        $user->email_verified_at = now();
        $user->save();

        \Illuminate\Support\Facades\Cache::forget('email_verification_otp_' . $user->email);

        return response()->json([
            'message' => 'Account activated successfully!',
            'user' => $user
        ]);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Account is already verified'], 400);
        }

        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('email_verification_otp_' . $user->email, $otp, now()->addMinutes(15));
        \Illuminate\Support\Facades\Log::info("Resent Email verification OTP for {$user->email}: {$otp}");

        // Send OTP via email
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your new Notes App verification code is: {$otp}\n\nThis code expires in 15 minutes.",
                function ($message) use ($user, $otp) {
                    $message->to($user->email, $user->name)
                            ->subject('Your Notes App Verification Code: ' . $otp);
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to resend OTP email: " . $e->getMessage());
        }

        return response()->json(['message' => 'New OTP code sent to your email.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
