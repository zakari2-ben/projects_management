import { Link } from 'react-router-dom'
import '../styles/components/TaskCard.css'

export default function TaskCard({ projectId, task }) {
  return (
    <div className="task-card">
      <h4 className="task-card__title">{task.name}</h4>
      <p className="task-card__description">{task.description || 'No description'}</p>
      <div className="task-card__meta">
        Due: {task.due_date || 'N/A'} | Assignee: {task.assignee?.name || 'Unassigned'}
      </div>
      <Link to={`/projects/${projectId}/tasks/${task.id}`} className="task-card__link">
        View details
      </Link>
    </div>
  )
}
