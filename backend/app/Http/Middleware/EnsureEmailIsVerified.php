<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && is_null($request->user()->email_verified_at)) {
            return response()->json([
                'message' => 'Your account must be activated before accessing notes.',
                'requires_verification' => true
            ], 403);
        }

        return $next($request);
    }
}
