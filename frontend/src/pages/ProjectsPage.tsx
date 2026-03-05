import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import { useProjects } from '../context/ProjectContext'

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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
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
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              Join project
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
            >
              New project
            </button>
          </div>
        </div>

        {loading ? <p className="mt-6">Loading...</p> : null}

        {!loading && projects.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No projects yet" description="Create or join a project to start." />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <Modal open={isCreateOpen} title="Create project" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            rows={3}
          />
          <button type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-white">
            Create
          </button>
        </form>
      </Modal>

      <Modal open={isJoinOpen} title="Join project" onClose={() => setJoinOpen(false)}>
        <form onSubmit={handleJoin} className="space-y-3">
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite code"
            className="w-full rounded-md border border-slate-300 px-3 py-2 uppercase"
            required
          />
          <button type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-white">
            Join
          </button>
        </form>
      </Modal>
    </div>
  )
}
