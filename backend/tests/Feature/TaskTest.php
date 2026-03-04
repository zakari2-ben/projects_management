<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_create_task_inside_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $user->id]);
        $project->members()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/projects/{$project->id}/tasks", [
            'name' => 'Create API docs',
            'status' => Task::STATUS_TODO,
        ]);

        $response->assertCreated()
            ->assertJsonPath('task.name', 'Create API docs');
    }

    public function test_member_can_change_task_status(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $owner->id]);
        $project->members()->attach($owner->id);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'status' => Task::STATUS_TODO,
        ]);

        $response = $this->actingAs($owner)->patchJson("/api/projects/{$project->id}/tasks/{$task->id}/status", [
            'status' => Task::STATUS_IN_PROGRESS,
        ]);

        $response->assertOk()->assertJsonPath('task.status', Task::STATUS_IN_PROGRESS);
    }

    public function test_cannot_assign_task_to_non_member(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $owner->id]);
        $project->members()->attach($owner->id);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->patchJson("/api/projects/{$project->id}/tasks/{$task->id}/assign", [
            'assigned_user_id' => $outsider->id,
        ]);

        $response->assertStatus(422);
    }
}
