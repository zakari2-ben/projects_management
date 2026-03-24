<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordConfirmationController extends Controller
{
    /**
     * Confirm the user's current password before a sensitive action.
     *
     * Your React frontend should call this endpoint before allowing the user
     * to perform sensitive operations (e.g. delete account, change email).
     * On success, return 200 OK — the frontend tracks confirmation state.
     *
     * Route: POST /api/confirm-password
     * Middleware: auth:sanctum
     *
     * @throws ValidationException  When the provided password is incorrect.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->string('password')->toString(), $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        return response()->json([
            'message' => 'Password confirmed.',
        ]);
    }
}
