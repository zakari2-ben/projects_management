<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
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
            'status' => TaskStatus::Todo->value,
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
            'status' => TaskStatus::Todo->value,
        ]);

        $response = $this->actingAs($owner)->patchJson("/api/projects/{$project->id}/tasks/{$task->id}/status", [
            'status' => TaskStatus::InProgress->value,
        ]);

        $response->assertOk()->assertJsonPath('task.status', TaskStatus::InProgress->value);
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

    public function test_task_dependencies_must_belong_to_same_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $owner->id]);
        $anotherProject = Project::factory()->create(['created_by' => $owner->id]);

        $project->members()->attach($owner->id);
        $anotherProject->members()->attach($owner->id);

        $externalTask = Task::factory()->create([
            'project_id' => $anotherProject->id,
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->postJson("/api/projects/{$project->id}/tasks", [
            'name' => 'Task with invalid dependency',
            'dependency_ids' => [$externalTask->id],
        ]);

        $response->assertStatus(422);
    }

    public function test_member_can_filter_tasks_by_status(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $owner->id]);
        $project->members()->attach($owner->id);

        Task::factory()->create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'name' => 'Backlog',
            'status' => TaskStatus::Todo->value,
        ]);
        Task::factory()->create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'name' => 'In progress task',
            'status' => TaskStatus::InProgress->value,
        ]);

        $response = $this->actingAs($owner)->getJson("/api/projects/{$project->id}/tasks?status=todo");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', TaskStatus::Todo->value)
            ->assertJsonPath('data.0.name', 'Backlog');
    }
}
