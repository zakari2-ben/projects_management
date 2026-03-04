<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $task->project->isMember($user->id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        return $task->project->created_by === $user->id || $task->created_by === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $task->project->created_by === $user->id || $task->created_by === $user->id;
    }
}
