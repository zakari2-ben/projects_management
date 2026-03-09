<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'name' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(TaskStatus::values()),
            'priority' => fake()->randomElement(TaskPriority::values()),
            'labels' => [],
            'subtasks' => [],
            'start_date' => fake()->optional()->date(),
            'due_date' => fake()->optional()->date(),
            'dependency_ids' => [],
            'assigned_user_id' => null,
            'created_by' => User::factory(),
        ];
    }
}
