<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = $request->user()
            ->projects()
            ->with('owner')
            ->withCount('tasks')
            ->latest('projects.id')
            ->get();

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = Project::create([
            ...$request->validated(),
            'invite_code' => $this->generateInviteCode(),
            'created_by' => $request->user()->id,
        ]);

        $project->members()->attach($request->user()->id);
        $project->load(['owner', 'members']);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => ProjectResource::make($project),
        ], 201);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        $this->authorize('view', $project);
        $project->load(['owner', 'members'])->loadCount('tasks');

        return ProjectResource::make($project);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());
        $project->load(['owner', 'members'])->loadCount('tasks');

        return response()->json([
            'message' => 'Project updated successfully.',
            'project' => ProjectResource::make($project),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.',
        ]);
    }

    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invite_code' => ['required', 'string', 'exists:projects,invite_code'],
        ]);

        $project = Project::where('invite_code', $validated['invite_code'])->firstOrFail();
        $project->members()->syncWithoutDetaching([$request->user()->id]);
        $project->load(['owner', 'members'])->loadCount('tasks');

        return response()->json([
            'message' => 'Joined project successfully.',
            'project' => ProjectResource::make($project),
        ]);
    }

    public function users(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        return UserResource::collection(
            $project->members()->orderBy('name')->get()
        );
    }

    private function generateInviteCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Project::where('invite_code', $code)->exists());

        return $code;
    }
}
