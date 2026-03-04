<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_list_projects(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['created_by' => $user->id]);
        $project->members()->attach($user->id);

        $response = $this->actingAs($user)->getJson('/api/projects');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_user_can_create_project(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'name' => 'New Project',
            'description' => 'Project description',
        ]);

        $response->assertCreated()
            ->assertJsonPath('project.name', 'New Project');
    }

    public function test_user_can_join_project_by_invite_code(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create([
            'created_by' => $owner->id,
            'invite_code' => 'INVITE01',
        ]);
        $project->members()->attach($owner->id);

        $response = $this->actingAs($member)->postJson('/api/projects/join', [
            'invite_code' => 'INVITE01',
        ]);

        $response->assertOk()->assertJsonPath('project.invite_code', 'INVITE01');
        $this->assertTrue($project->fresh()->isMember($member->id));
    }
}
