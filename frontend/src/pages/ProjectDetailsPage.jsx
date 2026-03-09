import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import ProjectCollaborationPanel from '../components/ProjectCollaborationPanel'
import ProjectCreateTaskSection from '../components/project-details/ProjectCreateTaskSection'
import ProjectTaskBoard from '../components/project-details/ProjectTaskBoard'
import { useAuth } from '../context/AuthContext'
import { useRichTextEditor } from '../hooks/useRichTextEditor'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import { normalizeDependencyIds, normalizeSubtasks, parseLabelsInput } from '../utils/taskFields'
import '../styles/pages/ProjectDetailsPage.css'

const initialFormState = {
  name: '',
  description: '',
  startDate: '',
  dueDate: '',
  priority: 'medium',
  labelsInput: '',
  assignedUserId: '',
  selectedDependencyIds: [],
  subtasks: [],
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const id = Number(projectId)
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [formState, setFormState] = useState(initialFormState)
  const [collabEvents, setCollabEvents] = useState([])
  const [selectedCommentTaskId, setSelectedCommentTaskId] = useState('')
  const [taskCommentCounts, setTaskCommentCounts] = useState({})

  const currentUser = user || { id: 'guest', name: 'Guest User', email: 'guest@local' }

  const { editor, editorFontFamily, setEditorFontFamily, applyLink, handleImageUpload, resetEditor } =
    useRichTextEditor({
      contentClassName: 'project-details-page__editor-content',
      onChange: (value) => setFormState((prev) => ({ ...prev, description: value })),
    })

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo'),
      in_progress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks],
  )

  const dependencyOptions = useMemo(() => tasks.map((task) => ({ id: task.id, name: task.name })), [tasks])

  const effectiveSelectedCommentTaskId = useMemo(() => {
    if (tasks.length === 0) return ''
    const exists = tasks.some((task) => String(task.id) === String(selectedCommentTaskId))
    return exists ? String(selectedCommentTaskId) : String(tasks[0].id)
  }, [selectedCommentTaskId, tasks])

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
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Could not load project details')
      }
    }

    void load()
  }, [id])

  const buildEventNotifications = (targets, title, message, taskId) =>
    [...new Set(targets.map((target) => String(target)).filter(Boolean))]
      .filter((target) => target !== String(currentUser.id))
      .flatMap((recipientId) => [
        {
          id: `${Date.now()}-${recipientId}-inapp`,
          recipientId,
          channel: 'in_app',
          title,
          message,
          taskId,
          createdAt: new Date().toISOString(),
          readAt: null,
        },
        {
          id: `${Date.now()}-${recipientId}-email`,
          recipientId,
          channel: 'email',
          title,
          message,
          taskId,
          createdAt: new Date().toISOString(),
          readAt: null,
          status: 'queued',
          sentAt: null,
        },
      ])

  const pushCollabEvent = (event) => {
    setCollabEvents((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), ...event },
      ...prev,
    ])
  }

  const handleFormField = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()
    if (formState.startDate && formState.dueDate && formState.dueDate < formState.startDate) {
      toast.error('Due date must be after start date')
      return
    }

    try {
      const payload = {
        name: formState.name,
        description: formState.description,
        start_date: formState.startDate || undefined,
        due_date: formState.dueDate || undefined,
        priority: formState.priority,
        labels: parseLabelsInput(formState.labelsInput),
        subtasks: normalizeSubtasks(formState.subtasks),
        dependency_ids: normalizeDependencyIds(formState.selectedDependencyIds),
        assigned_user_id: formState.assignedUserId ? Number(formState.assignedUserId) : null,
      }

      const newTask = await tasksApi.createTask(id, payload)
      setTasks((prev) => [newTask, ...prev])
      setFormState(initialFormState)
      resetEditor()
      setSelectedCommentTaskId(String(newTask.id))
      toast.success('Task created')

      pushCollabEvent({
        message: `${currentUser.name} created task "${newTask.name}"`,
        notifications: buildEventNotifications(
          [newTask.assignee?.id],
          'New task assigned',
          `You were assigned to "${newTask.name}"`,
          newTask.id,
        ),
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not create task')
    }
  }

  const handleMoveTask = async (task, status) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status)
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)))
      pushCollabEvent({
        message: `${currentUser.name} moved "${updated.name}" to ${status.replace('_', ' ')}`,
        notifications: buildEventNotifications(
          [updated.assignee?.id],
          'Task status updated',
          `"${updated.name}" moved to ${status.replace('_', ' ')}`,
          updated.id,
        ),
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not move task')
    }
  }

  const handleDeleteTask = async (task) => {
    const confirmDelete = window.confirm(`Delete "${task.name}"?`)
    if (!confirmDelete) return

    try {
      await tasksApi.deleteTask(id, task.id)
      setTasks((prev) => prev.filter((item) => item.id !== task.id))
      toast.success('Task deleted')
      pushCollabEvent({
        message: `${currentUser.name} deleted "${task.name}"`,
        notifications: buildEventNotifications(
          members.map((member) => member.id),
          'Task deleted',
          `"${task.name}" was deleted`,
          task.id,
        ),
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete task')
    }
  }

  const handleDependencyChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
    handleFormField('selectedDependencyIds', normalizeDependencyIds(values))
  }

  const updateSubtask = (index, next) => {
    handleFormField(
      'subtasks',
      formState.subtasks.map((subtask, itemIndex) => (itemIndex === index ? { ...subtask, ...next } : subtask)),
    )
  }

  return (
    <div className="project-details-page">
      <Navbar />
      <main className="project-details-page__main">
        <h1 className="project-details-page__title">{project?.name || 'Project'}</h1>
        <p className="project-details-page__description">{project?.description || 'No description'}</p>
        <p className="project-details-page__invite">Invite code: {project?.invite_code}</p>

        <ProjectCreateTaskSection
          formState={formState}
          members={members}
          dependencyOptions={dependencyOptions}
          selectedDependencyIds={formState.selectedDependencyIds}
          onSubmit={handleCreateTask}
          onFieldChange={handleFormField}
          onDependencyChange={handleDependencyChange}
          onAddSubtask={() => handleFormField('subtasks', [...formState.subtasks, { title: '', done: false }])}
          onUpdateSubtask={updateSubtask}
          onRemoveSubtask={(index) =>
            handleFormField(
              'subtasks',
              formState.subtasks.filter((_, itemIndex) => itemIndex !== index),
            )
          }
          editorProps={{
            editor,
            editorFontFamily,
            onFontFamilyChange: (family) => {
              setEditorFontFamily(family)
              editor?.chain().focus().setFontFamily(family).run()
            },
            onApplyLink: applyLink,
            onImageUpload: handleImageUpload,
          }}
        />

        <ProjectTaskBoard
          groupedTasks={groupedTasks}
          projectId={id}
          commentCounts={taskCommentCounts}
          onDeleteTask={handleDeleteTask}
          onOpenComments={(task) => setSelectedCommentTaskId(String(task.id))}
          onMoveTask={handleMoveTask}
        />

        <ProjectCollaborationPanel
          projectId={id}
          tasks={tasks}
          members={members}
          currentUser={currentUser}
          events={collabEvents}
          selectedTaskId={effectiveSelectedCommentTaskId}
          onSelectedTaskChange={setSelectedCommentTaskId}
          onCommentsCountChange={setTaskCommentCounts}
        />
      </main>
    </div>
  )
}
