<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\Task\AssignTaskRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService)
    {
    }
    public function index(Request $request, Project $project)
    {
        $this->ensureProjectMember($request->user()->id, $project);

        $tasks = $project->tasks()
            ->with(['assignee', 'creator'])
            ->latest('id')
            ->get();

        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->ensureProjectMember($request->user()->id, $project);
        $this->authorize('create', Task::class);

        if ($request->filled('assigned_user_id') && ! $project->isMember((int) $request->assigned_user_id)) {
            throw new HttpException(422, 'Assigned user must be a project member.');
        }

        $validated = $request->validated();
        $dependencyIds = $validated['dependency_ids'] ?? [];
        $this->taskService->ensureDependenciesBelongToProject($project, $dependencyIds);

        $task = $project->tasks()->create([
            ...$validated,
            'status' => $request->enum('status', TaskStatus::class)?->value ?? TaskStatus::Todo->value,
            'priority' => $request->enum('priority', TaskPriority::class)?->value ?? TaskPriority::Medium->value,
            'labels' => $this->taskService->sanitizeLabels($validated['labels'] ?? []),
            'subtasks' => $this->taskService->sanitizeSubtasks($validated['subtasks'] ?? []),
            'dependency_ids' => $this->taskService->sanitizeDependencyIds($dependencyIds),
            'created_by' => $request->user()->id,
        ]);

        $task->load(['assignee', 'creator']);

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => TaskResource::make($task),
        ], 201);
    }

    public function show(Request $request, Project $project, Task $task): TaskResource
    {
        $this->ensureTaskBelongsToProject($project, $task);
        $this->authorize('view', $task);

        return TaskResource::make($task->load(['assignee', 'creator']));
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToProject($project, $task);
        $this->authorize('update', $task);

        if ($request->filled('assigned_user_id') && ! $project->isMember((int) $request->assigned_user_id)) {
            throw new HttpException(422, 'Assigned user must be a project member.');
        }

        $validated = $request->validated();

        if (array_key_exists('dependency_ids', $validated)) {
            $this->taskService->ensureDependenciesBelongToProject($project, $validated['dependency_ids'] ?? [], $task->id);
            $validated['dependency_ids'] = $this->taskService->sanitizeDependencyIds($validated['dependency_ids'] ?? []);
        }

        if (array_key_exists('labels', $validated)) {
            $validated['labels'] = $this->taskService->sanitizeLabels($validated['labels'] ?? []);
        }

        if (array_key_exists('subtasks', $validated)) {
            $validated['subtasks'] = $this->taskService->sanitizeSubtasks($validated['subtasks'] ?? []);
        }

        $task->update($validated);
        $task->load(['assignee', 'creator']);

        return response()->json([
            'message' => 'Task updated successfully.',
            'task' => TaskResource::make($task),
        ]);
    }

    public function destroy(Project $project, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToProject($project, $task);
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToProject($project, $task);
        $this->authorize('update', $task);

        $task->update([
            'status' => $request->string('status')->toString(),
        ]);

        return response()->json([
            'message' => 'Task status updated successfully.',
            'task' => TaskResource::make($task->load(['assignee', 'creator'])),
        ]);
    }

    public function assign(AssignTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToProject($project, $task);
        $this->authorize('update', $task);

        $assignedUserId = $request->input('assigned_user_id');

        if (! is_null($assignedUserId) && ! $project->isMember((int) $assignedUserId)) {
            throw new HttpException(422, 'Assigned user must be a project member.');
        }

        $task->update(['assigned_user_id' => $assignedUserId]);

        return response()->json([
            'message' => is_null($assignedUserId) ? 'Task unassigned successfully.' : 'Task assigned successfully.',
            'task' => TaskResource::make($task->load(['assignee', 'creator'])),
        ]);
    }

    private function ensureProjectMember(int $userId, Project $project): void
    {
        if (! $project->isMember($userId)) {
            abort(403, 'You are not a member of this project.');
        }
    }

    private function ensureTaskBelongsToProject(Project $project, Task $task): void
    {
        if ($task->project_id !== $project->id) {
            abort(404, 'Task not found in this project.');
        }
    }
}
