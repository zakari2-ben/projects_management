<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Custom Reset Password Notification.
 *
 * Overrides Laravel's default reset password email to generate a URL
 * pointing to the React frontend (not a Blade route), so the SPA can
 * handle the password reset form.
 *
 * Required .env key: FRONTEND_URL (e.g. http://localhost:5173)
 */
class ResetPasswordNotification extends ResetPassword
{
    /**
     * Get the reset URL for the given notifiable.
     * Points to the React SPA reset-password page.
     */
    protected function resetUrl(mixed $notifiable): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return $frontendUrl . '/reset-password?' . http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Reset Your Password')
            ->greeting('Hello!')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in ' . config('auth.passwords.users.expire', 60) . ' minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
