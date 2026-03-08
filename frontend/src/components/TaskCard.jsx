import { Link } from 'react-router-dom'

export default function TaskCard({ projectId, task }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h4 className="font-medium text-slate-900">{task.name}</h4>
      <p className="mt-1 text-sm text-slate-600">{task.description || 'No description'}</p>
      <div className="mt-2 text-xs text-slate-500">
        Due: {task.due_date || 'N/A'} | Assignee: {task.assignee?.name || 'Unassigned'}
      </div>
      <Link
        to={`/projects/${projectId}/tasks/${task.id}`}
        className="mt-3 inline-block text-sm font-medium text-blue-600"
      >
        View details
      </Link>
    </div>
  )
}
