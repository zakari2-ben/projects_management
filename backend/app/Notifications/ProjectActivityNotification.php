<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectActivityNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $type,
        private readonly array $data
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'         => $this->type,
            'project_id'   => $this->data['project_id']   ?? null,
            'project_name' => $this->data['project_name'] ?? null,
            'task_id'      => $this->data['task_id']      ?? null,
            'actor_id'     => $this->data['actor_id']     ?? null,
            'actor_name'   => $this->data['actor_name']   ?? null,
            'message'      => $this->data['message']      ?? '',
        ];
    }
}
