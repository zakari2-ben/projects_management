import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import type { Task, TaskStatus, User } from '../types'

const statuses: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TaskDetailsPage() {
  const { projectId, taskId } = useParams()
  const projectIdNumber = Number(projectId)
  const taskIdNumber = Number(taskId)
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [assignedUserId, setAssignedUserId] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, memberData] = await Promise.all([
          tasksApi.getTask(projectIdNumber, taskIdNumber),
          projectsApi.getProjectMembers(projectIdNumber),
        ])
        setTask(taskData)
        setMembers(memberData)
        setName(taskData.name)
        setDescription(taskData.description || '')
        setDueDate(taskData.due_date || '')
        setStatus(taskData.status)
        setAssignedUserId(taskData.assigned_user_id ? String(taskData.assigned_user_id) : '')
      } catch {
        toast.error('Could not load task')
      }
    }

    void load()
  }, [projectIdNumber, taskIdNumber])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const updated = await tasksApi.updateTask(projectIdNumber, taskIdNumber, {
        name,
        description,
        due_date: dueDate || undefined,
        status,
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      })
      setTask(updated)
      toast.success('Task updated')
    } catch {
      toast.error('Could not update task')
    }
  }

  const handleDelete = async () => {
    if (!task) return
    try {
      await tasksApi.deleteTask(projectIdNumber, task.id)
      toast.success('Task deleted')
      navigate(`/projects/${projectIdNumber}`)
    } catch {
      toast.error('Could not delete task')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Task Details</h1>
        <form onSubmit={handleSave} className="mt-5 space-y-3 rounded-xl bg-white p-5 shadow">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            rows={4}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              {statuses.map((statusItem) => (
                <option key={statusItem.value} value={statusItem.value}>
                  {statusItem.label}
                </option>
              ))}
            </select>
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
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-white">
              Save changes
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="rounded-md border border-rose-300 px-3 py-2 text-rose-600"
            >
              Delete task
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
