<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class ResetPasswordController extends Controller
{
    /**
     * Handle an incoming password reset request.
     *
     * Fixes the previous bug where the password was stored in plain text.
     * Now properly hashes the password before saving and fires the
     * PasswordReset event which revokes all existing tokens.
     *
     * @throws ValidationException  When the token or email is invalid.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                // Properly hash the password before saving (bug fix)
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                // Revoke all existing Sanctum tokens for security
                $user->tokens()->delete();

                // Fire Laravel's PasswordReset event
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => __($status),
        ]);
    }
}
