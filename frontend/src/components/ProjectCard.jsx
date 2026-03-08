import { Link } from 'react-router-dom'
import '../styles/components/ProjectCard.css'

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <h3 className="project-card__title">{project.name}</h3>
      <p className="project-card__description">{project.description || 'No description provided.'}</p>
      <div className="project-card__invite">Invite code: {project.invite_code}</div>
      <Link to={`/projects/${project.id}`} className="project-card__link">
        Open project
      </Link>
    </div>
  )
}
