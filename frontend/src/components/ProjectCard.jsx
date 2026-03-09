import { Link } from 'react-router-dom'
import '../styles/components/ProjectCard.css'

export default function ProjectCard({ project }) {
  const tasksCount = project.tasks_count ?? 0
  const membersCount = project.members_count ?? project.members?.length ?? 0

  return (
    <div className="project-card">
      <h3 className="project-card__title">{project.name}</h3>
      <p className="project-card__description">{project.description || 'No description provided.'}</p>
      <div className="project-card__meta">
        <span>Tasks: {tasksCount}</span>
        <span>Members: {membersCount}</span>
      </div>
      <div className="project-card__owner">Owner: {project.owner?.name || 'Unknown'}</div>
      <div className="project-card__invite">Invite code: {project.invite_code}</div>
      <Link to={`/projects/${project.id}`} className="project-card__link">
        Open project
      </Link>
    </div>
  )
}
