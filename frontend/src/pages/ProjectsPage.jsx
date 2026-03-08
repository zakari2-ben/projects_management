import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import { useProjects } from '../context/ProjectContext'
import '../styles/pages/ProjectsPage.css'

export default function ProjectsPage() {
  const { projects, loading, fetchProjects, createProject, joinProject } = useProjects()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isJoinOpen, setJoinOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  const handleCreate = async (event) => {
    event.preventDefault()
    try {
      await createProject(name, description)
      toast.success('Project created')
      setName('')
      setDescription('')
      setCreateOpen(false)
    } catch {
      toast.error('Could not create project')
    }
  }

  const handleJoin = async (event) => {
    event.preventDefault()
    try {
      await joinProject(inviteCode)
      toast.success('Joined project')
      setInviteCode('')
      setJoinOpen(false)
    } catch {
      toast.error('Invalid invite code')
    }
  }

  return (
    <div className="projects-page">
      <Navbar />
      <main className="projects-page__main">
        <div className="projects-page__header">
          <h1 className="projects-page__title">Projects</h1>
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

        {loading ? <p className="projects-page__loading">Loading...</p> : null}

        {!loading && projects.length === 0 ? (
          <div className="projects-page__empty">
            <EmptyState title="No projects yet" description="Create or join a project to start." />
          </div>
        ) : null}

        <div className="projects-page__grid">
          {projects.map((project) => (
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
          <button type="submit" className="projects-page__modal-submit">
            Create
          </button>
        </form>
      </Modal>

      <Modal open={isJoinOpen} title="Join project" onClose={() => setJoinOpen(false)}>
        <form onSubmit={handleJoin} className="projects-page__modal-form">
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite code"
            className="projects-page__input projects-page__input--uppercase"
            required
          />
          <button type="submit" className="projects-page__modal-submit">
            Join
          </button>
        </form>
      </Modal>
    </div>
  )
}
