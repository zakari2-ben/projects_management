import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import '../styles/pages/TaskDetailsPage.css'

const statuses = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TaskDetailsPage() {
  const { projectId, taskId } = useParams()
  const projectIdNumber = Number(projectId)
  const taskIdNumber = Number(taskId)
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('todo')
  const [assignedUserId, setAssignedUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch task + members together, then hydrate form state from API values.
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
        // Keep select value as string for controlled <select>.
        setAssignedUserId(taskData.assigned_user_id ? String(taskData.assigned_user_id) : '')
      } catch {
        toast.error('Could not load task')
      }
    }

    void load()
  }, [projectIdNumber, taskIdNumber])

  const handleSave = async (event) => {
    event.preventDefault()
    try {
      const updated = await tasksApi.updateTask(projectIdNumber, taskIdNumber, {
        name,
        description,
        due_date: dueDate || undefined,
        status,
        // Convert back to number|null before sending payload.
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
    <div className="task-details-page">
      <Navbar />
      <main className="task-details-page__main">
        <h1 className="task-details-page__title">Task Details</h1>
        <form onSubmit={handleSave} className="task-details-page__form">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="task-details-page__input"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="task-details-page__textarea"
            rows={4}
          />
          <div className="task-details-page__selectors">
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="task-details-page__input"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="task-details-page__input"
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
              className="task-details-page__input"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="task-details-page__actions">
            <button type="submit" className="task-details-page__save">
              Save changes
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="task-details-page__delete"
            >
              Delete task
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
