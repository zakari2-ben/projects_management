import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import type { Project, Task, TaskStatus, User } from '../types'

const columns: Array<{ key: TaskStatus; title: string }> = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedUserId, setAssignedUserId] = useState<string>('')

  const groupedTasks = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === 'todo'),
      in_progress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }
  }, [tasks])

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, memberData, taskData] = await Promise.all([
          projectsApi.getProject(id),
          projectsApi.getProjectMembers(id),
          tasksApi.getTasks(id),
        ])
        setProject(projectData)
        setMembers(memberData)
        setTasks(taskData)
      } catch {
        toast.error('Could not load project details')
      }
    }

    void load()
  }, [id])

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const newTask = await tasksApi.createTask(id, {
        name,
        description,
        due_date: dueDate || undefined,
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      })
      setTasks((prev) => [newTask, ...prev])
      setName('')
      setDescription('')
      setDueDate('')
      setAssignedUserId('')
      toast.success('Task created')
    } catch {
      toast.error('Could not create task')
    }
  }

  const quickMove = async (task: Task, status: TaskStatus) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status)
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)))
    } catch {
      toast.error('Could not update task status')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold">{project?.name || 'Project'}</h1>
        <p className="mt-1 text-sm text-slate-600">{project?.description || 'No description'}</p>
        <p className="mt-1 text-xs text-slate-500">Invite code: {project?.invite_code}</p>

        <section className="mt-6 rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Create task</h2>
          <form onSubmit={handleCreateTask} className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Task name"
              className="rounded-md border border-slate-300 px-3 py-2"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
              rows={3}
            />
            <select
              value={assignedUserId}
              onChange={(event) => setAssignedUserId(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-white">
              Create task
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.key} className="rounded-xl bg-slate-100 p-3">
              <h3 className="mb-3 font-semibold text-slate-900">{column.title}</h3>
              <div className="space-y-3">
                {groupedTasks[column.key].map((task) => (
                  <div key={task.id}>
                    <TaskCard projectId={id} task={task} />
                    <div className="mt-2 flex gap-1">
                      {columns
                        .filter((item) => item.key !== task.status)
                        .map((target) => (
                          <button
                            key={target.key}
                            type="button"
                            onClick={() => void quickMove(task, target.key)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                          >
                            Move to {target.title}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
