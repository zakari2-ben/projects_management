import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import KpiCard from '../components/KpiCard'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import ProjectsHeader from '../components/projects/ProjectsHeader'
import ProjectsFilters from '../components/projects/ProjectsFilters'
import CreateProjectModal from '../components/projects/CreateProjectModal'
import JoinProjectModal from '../components/projects/JoinProjectModal'
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
        <ProjectsHeader onOpenJoin={() => setJoinOpen(true)} onOpenCreate={() => setCreateOpen(true)} />

        <section className="projects-page__kpis">
          <KpiCard label="Total Projects" value={kpis.totalProjects} />
          <KpiCard label="Tasks In Portfolio" value={kpis.totalTasks} />
          <KpiCard label="Member Slots" value={kpis.totalMembers} />
        </section>

        <ProjectsFilters search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />

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

      <CreateProjectModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        submitting={createSubmitting}
      />

      <JoinProjectModal
        open={isJoinOpen}
        onClose={() => setJoinOpen(false)}
        onSubmit={handleJoin}
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        submitting={joinSubmitting}
      />
    </div>
  )
}
