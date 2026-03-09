import { Link, useNavigate } from 'react-router-dom'
import '../styles/components/TaskCard.css'

export default function TaskCard({ projectId, task, onDelete }) {
  const navigate = useNavigate()

  const plainDescription = (task.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const statusLabel =
    task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'

  return (
    <div className="task-card">
      <div className="task-card__top">
        <h4 className="task-card__title">{task.name}</h4>
        <span className="task-card__status">{statusLabel}</span>
      </div>

      <p className="task-card__description">{plainDescription || 'No description'}</p>

      <div className="task-card__meta">
        <span className="task-card__meta-item">Due: {task.due_date || 'N/A'}</span>
        <span className="task-card__meta-item">Assignee: {task.assignee?.name || 'Unassigned'}</span>
      </div>

      <div className="task-card__actions">
        <Link
          to={`/projects/${projectId}/tasks/${task.id}`}
          className="task-card__icon-button"
          title="View task"
          aria-label="View task"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
        </Link>

        <button
          type="button"
          className="task-card__icon-button"
          title="Edit task"
          aria-label="Edit task"
          onClick={() =>
            navigate(`/projects/${projectId}/tasks/${task.id}`, {
              state: { editMode: true },
            })
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.84Z" />
          </svg>
        </button>

        <button
          type="button"
          className="task-card__icon-button task-card__icon-button--danger"
          title="Delete task"
          aria-label="Delete task"
          onClick={() => onDelete?.(task)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 2H8l1-2Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
