import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import '../styles/pages/ProjectDetailsPage.css'

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedUserId, setAssignedUserId] = useState('')

  // Derive kanban columns from one source of truth (tasks state).
  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo'),
      in_progress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks],
  )

  useEffect(() => {
    const load = async () => {
      try {
        // Load all required project data in parallel to reduce waiting time.
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

  const handleCreateTask = async (event) => {
    event.preventDefault()
    try {
      const newTask = await tasksApi.createTask(id, {
        name,
        description,
        due_date: dueDate || undefined,
        // API expects number|null, while <select> gives us a string.
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      })
      // Insert immediately in local state to avoid a full re-fetch.
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

  const quickMove = async (task, status) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status)
      // Replace only the moved task, keep all others unchanged.
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)))
    } catch {
      toast.error('Could not update task status')
    }
  }

  return (
    <div className="project-details-page">
      <Navbar />
      <main className="project-details-page__main">
        <h1 className="project-details-page__title">{project?.name || 'Project'}</h1>
        <p className="project-details-page__description">{project?.description || 'No description'}</p>
        <p className="project-details-page__invite">Invite code: {project?.invite_code}</p>

        <section className="project-details-page__create-task">
          <h2 className="project-details-page__section-title">Create task</h2>
          <form onSubmit={handleCreateTask} className="project-details-page__form">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Task name"
              className="project-details-page__input"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="project-details-page__input"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              className="project-details-page__textarea"
              rows={3}
            />
            <select
              value={assignedUserId}
              onChange={(event) => setAssignedUserId(event.target.value)}
              className="project-details-page__input"
            >
              <option value ="">Unassigned</option>
                {members.map((member) => (
                  <option key = {member.id} value = {member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}

              
            </select>
            <button type="submit" className="project-details-page__submit">
              Create task
            </button>
          </form>
        </section>

        <section className="project-details-page__columns">
          {columns.map((column) => (
            <div key={column.key} className="project-details-page__column">
              <h3 className="project-details-page__column-title">{column.title}</h3>
              <div className="project-details-page__task-list">
                {groupedTasks[column.key].map((task) => (
                  <div key={task.id}>
                    <TaskCard projectId={id} task={task} />
                    <div className="project-details-page__move-actions">
                      {columns
                        .filter((item) => item.key !== task.status)
                        .map((target) => (
                          <button
                            key={target.key}
                            type="button"
                            onClick={() => void quickMove(task, target.key)}
                            className="project-details-page__move-button"
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
