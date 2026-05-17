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

        // Auto login after registration
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
