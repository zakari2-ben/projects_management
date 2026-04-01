<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordConfirmationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ResetPasswordController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes ────────────────────────────────────────────────────────

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Password Reset (no auth required — user has lost access)
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])
    ->name('password.email');

Route::post('/reset-password', [ResetPasswordController::class, 'reset'])
    ->name('password.reset');

// ─── Protected Routes (requires Sanctum Bearer token) ──────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // ─── Auth ────────────────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ─── Email Verification ─────────────────────────────────────────────────
    // GET /email/verify/{id}/{hash}  — verifies a signed verification link
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    // POST /email/verification-notification  — resend the verification email
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // ─── Password Confirmation ──────────────────────────────────────────────
    // Confirm current password before a sensitive action on the frontend
    Route::post('/confirm-password', [PasswordConfirmationController::class, 'confirm']);

    // ─── Profile ────────────────────────────────────────────────────────────
    Route::get('/profile',          [ProfileController::class, 'show']);
    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/avatar',  [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile',       [ProfileController::class, 'destroy']);

    // ─── Notifications ──────────────────────────────────────────────────────
    Route::get('/notifications',                    [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all',         [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // ─── Projects & Tasks (no email verification required) ──────────────────
    Route::apiResource('projects', ProjectController::class);
    Route::post('/projects/join',            [ProjectController::class, 'join']);
    Route::get('/projects/{project}/users',  [ProjectController::class, 'users']);

    // ─── Tasks ──────────────────────────────────────────────────────────────
    Route::get('/projects/{project}/tasks',                 [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks',                [TaskController::class, 'store']);
    Route::get('/projects/{project}/tasks/{task}',          [TaskController::class, 'show']);
    Route::put('/projects/{project}/tasks/{task}',          [TaskController::class, 'update']);
    Route::delete('/projects/{project}/tasks/{task}',       [TaskController::class, 'destroy']);
    Route::patch('/projects/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::patch('/projects/{project}/tasks/{task}/assign', [TaskController::class, 'assign']);
});
