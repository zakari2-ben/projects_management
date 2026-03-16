<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;

class EmailVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     *
     * Route: GET /api/email/verify/{id}/{hash}
     * Middleware: auth:sanctum, signed, throttle:6,1
     */
    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
                'user'    => UserResource::make($request->user()),
            ]);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return response()->json([
            'message' => 'Email verified successfully.',
            'user'    => UserResource::make($request->user()->fresh()),
        ]);
    }

    /**
     * Resend the email verification notification.
     *
     * Route: POST /api/email/verification-notification
     * Middleware: auth:sanctum, throttle:6,1
     */
    public function resend(ResendVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.',
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent. Please check your email.',
        ]);
    }
}
