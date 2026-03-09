<?php

namespace App\Http\Resources;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $statusValue = $this->status instanceof BackedEnum
            ? $this->status->value
            : (string) $this->status;

        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'labels' => $this->labels ?? [],
            'subtasks' => $this->subtasks ?? [],
            'start_date' => $this->start_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'dependency_ids' => $this->dependency_ids ?? [],
            'assigned_user_id' => $this->assigned_user_id,
            'created_by' => $this->created_by,
            'assignee' => UserResource::make($this->whenLoaded('assignee')),
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'is_overdue' => $this->due_date !== null
                && $statusValue !== 'done'
                && $this->due_date->isPast(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
