import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import KpiCard from '../components/KpiCard'
import Modal from '../components/Modal'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import { useProjects } from '../context/ProjectContext'
import { getApiErrorDetails } from '../utils/http'
import '../styles/pages/ProjectsPage.css'

export default function ProjectsPage() {
  const { projects, loading, fetchProjects, createProject, joinProject } = useProjects()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isJoinOpen, setJoinOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [joinSubmitting, setJoinSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    const load = async () => {
      try {
        await fetchProjects()
      } catch (error) {
        toast.error(getApiErrorDetails(error, 'Could not load projects').message)
      }
    }

    void load()
  }, [fetchProjects])

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const baseList = projects.filter((project) => {
      if (!normalizedSearch) return true

      return [project.name, project.description, project.invite_code, project.owner?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })

    return [...baseList].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'tasks') return (b.tasks_count ?? 0) - (a.tasks_count ?? 0)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  }, [projects, search, sortBy])

  const kpis = useMemo(
    () => ({
      totalProjects: projects.length,
      totalTasks: projects.reduce((acc, project) => acc + (project.tasks_count ?? 0), 0),
      totalMembers: projects.reduce((acc, project) => acc + (project.members_count ?? 0), 0),
    }),
    [projects],
  )

  const handleCreate = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (trimmedName.length < 3) {
      toast.error('Project name must be at least 3 characters')
      return
    }

    setCreateSubmitting(true)
    try {
      await createProject(trimmedName, description.trim())
      toast.success('Project created')
      setName('')
      setDescription('')
      setCreateOpen(false)
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Could not create project').message)
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleJoin = async (event) => {
    event.preventDefault()

    const normalizedCode = inviteCode.trim().toUpperCase()
    if (normalizedCode.length !== 8) {
      toast.error('Invite code must be exactly 8 characters')
      return
    }

    setJoinSubmitting(true)
    try {
      await joinProject(normalizedCode)
      toast.success('Joined project')
      setInviteCode('')
      setJoinOpen(false)
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Invalid invite code').message)
    } finally {
      setJoinSubmitting(false)
    }
  }

  return (
    <div className="projects-page">
      <Navbar />
      <main className="projects-page__main">
        <div className="projects-page__header">
          <div>
            <h1 className="projects-page__title">Projects</h1>
            <p className="projects-page__subtitle">Keep all projects and members aligned in one place.</p>
          </div>
          <div className="projects-page__actions">
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="projects-page__button projects-page__button--secondary"
            >
              Join project
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="projects-page__button projects-page__button--primary"
            >
              New project
            </button>
          </div>
        </div>

        <section className="projects-page__kpis">
          <KpiCard label="Total Projects" value={kpis.totalProjects} />
          <KpiCard label="Tasks In Portfolio" value={kpis.totalTasks} />
          <KpiCard label="Member Slots" value={kpis.totalMembers} />
        </section>

        <section className="projects-page__filters">
          <input
            type="search"
            className="projects-page__input"
            placeholder="Search by name, invite code, owner..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="projects-page__input">
            <option value="recent">Sort: Most recent</option>
            <option value="name">Sort: Name A-Z</option>
            <option value="tasks">Sort: Most tasks</option>
          </select>
        </section>

        {loading ? <p className="projects-page__loading">Loading...</p> : null}

        {!loading && filteredProjects.length === 0 ? (
          <div className="projects-page__empty">
            <EmptyState
              title={projects.length === 0 ? 'No projects yet' : 'No matches'}
              description={
                projects.length === 0
                  ? 'Create or join a project to start.'
                  : 'Try a different keyword or clear filters.'
              }
            />
          </div>
        ) : null}

        <div className="projects-page__grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <Modal open={isCreateOpen} title="Create project" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="projects-page__modal-form">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="projects-page__input"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="projects-page__textarea"
            rows={3}
          />
          <button type="submit" disabled={createSubmitting} className="projects-page__modal-submit">
            {createSubmitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      </Modal>

      <Modal open={isJoinOpen} title="Join project" onClose={() => setJoinOpen(false)}>
        <form onSubmit={handleJoin} className="projects-page__modal-form">
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            placeholder="Invite code"
            className="projects-page__input projects-page__input--uppercase"
            required
          />
          <button type="submit" disabled={joinSubmitting} className="projects-page__modal-submit">
            {joinSubmitting ? 'Joining...' : 'Join'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
