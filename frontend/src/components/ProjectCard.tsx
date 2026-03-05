import { Link } from 'react-router-dom'
import type { Project } from '../types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
      <p className="mt-2 text-sm text-slate-600">{project.description || 'No description provided.'}</p>
      <div className="mt-3 text-xs text-slate-500">Invite code: {project.invite_code}</div>
      <Link
        to={`/projects/${project.id}`}
        className="mt-4 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
      >
        Open project
      </Link>
    </div>
  )
}
