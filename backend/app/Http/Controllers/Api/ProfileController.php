<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Return the authenticated user's profile.
     *
     * Route: GET /api/profile
     * Middleware: auth:sanctum
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserResource::make($request->user()),
        ]);
    }

    /**
     * Update the authenticated user's profile info (name, email).
     *
     * If the email changes, reset email_verified_at so the user must
     * re-verify their new email address.
     *
     * Route: PUT /api/profile
     * Middleware: auth:sanctum
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // If the email changed, reset verification status
        if (isset($data['email']) && $data['email'] !== $user->email) {
            $data['email_verified_at'] = null;
            $user->update($data);
            $user->sendEmailVerificationNotification();

            return response()->json([
                'message' => 'Profile updated. Please verify your new email address.',
                'user'    => UserResource::make($user->fresh()),
            ]);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => UserResource::make($user->fresh()),
        ]);
    }

    /**
     * Update the authenticated user's password.
     *
     * Route: PUT /api/profile/password
     * Middleware: auth:sanctum
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->string('password')->toString()),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Upload and store the authenticated user's avatar image.
     *
     * Stores in storage/app/public/avatars/ and deletes the old avatar.
     * Run `php artisan storage:link` once to make files web-accessible.
     *
     * Route: POST /api/profile/avatar
     * Middleware: auth:sanctum
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old avatar if it exists
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Store the new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar_path' => $path]);

        return response()->json([
            'message'    => 'Avatar uploaded successfully.',
            'avatar_url' => Storage::disk('public')->url($path),
            'user'       => UserResource::make($user->fresh()),
        ]);
    }

    /**
     * Permanently delete the authenticated user's account.
     *
     * - Revokes all Sanctum tokens
     * - Deletes avatar from storage
     * - Deletes the user record (cascades via DB constraints)
     *
     * Route: DELETE /api/profile
     * Middleware: auth:sanctum
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $user = $request->user();

        // Revoke all tokens
        $user->tokens()->delete();

        // Delete avatar from storage
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Delete the user
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.',
        ]);
    }
}
