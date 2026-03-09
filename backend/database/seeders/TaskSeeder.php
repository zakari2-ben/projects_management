<?php

namespace Database\Seeders;

use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $project = Project::where('invite_code', 'WEB2026A')->firstOrFail();
        $owner = User::where('email', 'owner@example.com')->firstOrFail();
        $member1 = User::where('email', 'member1@example.com')->firstOrFail();
        $member2 = User::where('email', 'member2@example.com')->firstOrFail();

        Task::query()->updateOrCreate(
            ['project_id' => $project->id, 'name' => 'Design landing hero'],
            [
                'description' => 'Create new hero section visuals and copy.',
                'status' => TaskStatus::Todo->value,
                'due_date' => now()->addDays(5)->toDateString(),
                'assigned_user_id' => $member1->id,
                'created_by' => $owner->id,
            ]
        );

        Task::query()->updateOrCreate(
            ['project_id' => $project->id, 'name' => 'Build auth API'],
            [
                'description' => 'Implement Sanctum auth endpoints and tests.',
                'status' => TaskStatus::InProgress->value,
                'due_date' => now()->addDays(7)->toDateString(),
                'assigned_user_id' => $member2->id,
                'created_by' => $owner->id,
            ]
        );

        Task::query()->updateOrCreate(
            ['project_id' => $project->id, 'name' => 'Deploy staging'],
            [
                'description' => 'Deploy latest build to staging environment.',
                'status' => TaskStatus::Done->value,
                'due_date' => now()->addDays(2)->toDateString(),
                'assigned_user_id' => null,
                'created_by' => $owner->id,
            ]
        );
    }
}
