<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectActivityNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class ProjectNotificationService
{
    public function notifyProject(Project $project, User $actor, string $type, string $message, array $extra = []): void
    {
        // Notify all members, including the actor, without duplicates.
        $recipients = $project->members()->get()->unique('id');

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send(
            $recipients,
            new ProjectActivityNotification($type, [
                'project_id'   => $project->id,
                'project_name' => $project->name,
                'message'      => $message,
                'actor_id'     => $actor->id,
                'actor_name'   => $actor->name,
                ...$extra,
            ])
        );
    }

    public function notifyUserProjects(User $actor, string $type, string $message): void
    {
        $projects = $actor->projects()->with('members')->get();

        /** @var Collection<int, int> $alreadyNotified */
        $alreadyNotified = collect();

        foreach ($projects as $project) {
            $recipients = $project->members
                ->whereNotIn('id', $alreadyNotified);

            if ($recipients->isEmpty()) {
                continue;
            }

            Notification::send(
                $recipients,
                new ProjectActivityNotification($type, [
                    'project_id'   => $project->id,
                    'project_name' => $project->name,
                    'message'      => $message,
                    'actor_id'     => $actor->id,
                    'actor_name'   => $actor->name,
                ])
            );

            $alreadyNotified = $alreadyNotified->merge($recipients->pluck('id'));
        }
    }
}
