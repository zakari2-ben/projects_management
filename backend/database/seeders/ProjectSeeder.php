<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = User::where('email', 'owner@example.com')->firstOrFail();
        $member1 = User::where('email', 'member1@example.com')->firstOrFail();
        $member2 = User::where('email', 'member2@example.com')->firstOrFail();

        $project = Project::query()->updateOrCreate(
            ['invite_code' => 'WEB2026A'],
            [
                'name' => 'Website Redesign',
                'description' => 'Redesign public marketing website and improve project flow.',
                'created_by' => $owner->id,
            ]
        );

        $project->members()->sync([$owner->id, $member1->id, $member2->id]);
    }
}
