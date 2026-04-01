<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->data ?? [];

        return [
            'id'           => $this->id,
            'type'         => $data['type'] ?? 'info',
            'message'      => $data['message'] ?? '',
            'project_id'   => $data['project_id'] ?? null,
            'project_name' => $data['project_name'] ?? null,
            'task_id'      => $data['task_id'] ?? null,
            'actor_id'     => $data['actor_id'] ?? null,
            'actor_name'   => $data['actor_name'] ?? null,
            'read_at'      => $this->read_at,
            'created_at'   => $this->created_at,
        ];
    }
}
