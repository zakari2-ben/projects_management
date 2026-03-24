<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * - Creates the user record
     * - Issues a Sanctum API token (Bearer token)
     * - Sends the email verification notification
     *
     * @return JsonResponse  HTTP 201 with user + token
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->string('name')->toString(),
            'email'    => $request->string('email')->toString(),
            'password' => Hash::make($request->string('password')->toString()),
        ]);

        // Send email verification notification
        $user->sendEmailVerificationNotification();

        // Issue Sanctum Bearer token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully. Please verify your email.',
            'token'   => $token,
            'user'    => UserResource::make($user),
        ], 201);
    }

    /**
     * Authenticate an existing user.
     *
     * - Validates credentials
     * - Issues a fresh Sanctum API token
     *
     * @return JsonResponse  HTTP 200 with user + token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Revoke all previous tokens (single-session strategy) then issue a new one
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token'   => $token,
            'user'    => UserResource::make($user),
        ]);
    }

    /**
     * Revoke the current user's API token (logout).
     *
     * Uses instanceof check to gracefully handle Sanctum's TransientToken
     * (which is used in tests with actingAs() and has no delete() method).
     *
     * @return JsonResponse  HTTP 200 with success message
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        // TransientToken is used in testing (actingAs) and doesn't support delete()
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Return the currently authenticated user.
     *
     * @return UserResource
     */
    public function me(Request $request): UserResource
    {
        return UserResource::make($request->user());
    }
}
