<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TaskService
{
    public function sanitizeLabels(array $labels): array
    {
        return collect($labels)
            ->map(static fn (mixed $label) => trim((string) $label))
            ->filter(static fn (string $label) => $label !== '')
            ->unique()
            ->values()
            ->all();
    }

    public function sanitizeSubtasks(array $subtasks): array
    {
        return collect($subtasks)
            ->map(static function (mixed $subtask): ?array {
                if (! is_array($subtask)) {
                    return null;
                }

                $title = trim((string) ($subtask['title'] ?? ''));
                if ($title === '') {
                    return null;
                }

                return [
                    'title' => $title,
                    'done' => (bool) ($subtask['done'] ?? false),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    public function sanitizeDependencyIds(array $dependencyIds): array
    {
        return collect($dependencyIds)
            ->map(static fn (mixed $id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function ensureDependenciesBelongToProject(Project $project, array $dependencyIds, ?int $currentTaskId = null): void
    {
        $ids = $this->sanitizeDependencyIds($dependencyIds);

        if ($currentTaskId && in_array($currentTaskId, $ids, true)) {
            throw new HttpException(422, 'A task cannot depend on itself.');
        }

        if ($ids === []) {
            return;
        }

        $matchingCount = Task::query()
            ->where('project_id', $project->id)
            ->whereIn('id', $ids)
            ->count();

        if ($matchingCount !== count($ids)) {
            throw new HttpException(422, 'Dependencies must belong to the same project.');
        }
    }
}
