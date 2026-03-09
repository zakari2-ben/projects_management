import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import KpiCard from '../components/KpiCard'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectContext'
import { getApiErrorDetails } from '../utils/http'
import '../styles/pages/DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, fetchProjects } = useProjects()

  useEffect(() => {
    const load = async () => {
      try {
        await fetchProjects()
      } catch (error) {
        toast.error(getApiErrorDetails(error, 'Could not load dashboard metrics').message)
      }
    }

    void load()
  }, [fetchProjects])

  const stats = useMemo(() => {
    const totalTasks = projects.reduce((acc, project) => acc + (project.tasks_count ?? 0), 0)
    const totalMembers = projects.reduce((acc, project) => acc + (project.members_count ?? 0), 0)

    return {
      totalProjects: projects.length,
      totalTasks,
      totalMembers,
    }
  }, [projects])

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main">
        <h1 className="dashboard-page__title">Hello, {user?.name}</h1>
        <p className="dashboard-page__subtitle">Manage your projects, priorities, and team execution from one place.</p>

        <section className="dashboard-page__kpis">
          <KpiCard label="Projects" value={stats.totalProjects} />
          <KpiCard label="Portfolio Tasks" value={stats.totalTasks} />
          <KpiCard label="Member Slots" value={stats.totalMembers} />
        </section>

        <div className="dashboard-page__grid">
          <Link to="/projects" className="dashboard-page__card">
            <h2 className="dashboard-page__card-title">Project Workspace</h2>
            <p className="dashboard-page__card-text">Create projects, invite collaborators, and track work in real time.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
