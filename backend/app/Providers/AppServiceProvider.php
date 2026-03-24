<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\Task;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);

        \Illuminate\Auth\Notifications\VerifyEmail::createUrlUsing(function (object $notifiable) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

            $verifyUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                \Illuminate\Support\Carbon::now()->addMinutes(\Illuminate\Support\Facades\Config::get('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            return $frontendUrl . '/verify-email?url=' . urlencode($verifyUrl);
        });
    }
}
