import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import TaskDetailsReadView from '../components/task-details/TaskDetailsReadView'
import TaskDetailsEditForm from '../components/task-details/TaskDetailsEditForm'
import { useRichTextEditor } from '../hooks/useRichTextEditor'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import {
  getStatusLabel,
  getSubtaskProgress,
  labelsToInput,
  normalizeDependencyIds,
  normalizeSubtasks,
  parseLabelsInput,
  PRIORITY_LABELS,
} from '../utils/taskFields'
import { getApiErrorDetails } from '../utils/http'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import '../styles/pages/TaskDetailsPage.css'

const initialFormState = {
  name: '',
  description: '',
  startDate: '',
  dueDate: '',
  status: 'todo',
  priority: 'medium',
  labelsInput: '',
  dependencyIds: [],
  subtasks: [],
  assignedUserId: '',
}

export default function TaskDetailsPage() {
  const { projectId, taskId } = useParams()
  const projectIdNumber = Number(projectId)
  const taskIdNumber = Number(taskId)
  const location = useLocation()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [projectTasks, setProjectTasks] = useState([])
  const [members, setMembers] = useState([])
  const [isEditing, setIsEditing] = useState(Boolean(location.state?.editMode))
  const [formState, setFormState] = useState(initialFormState)

  const { editor, editorFontFamily, setEditorFontFamily, applyLink, handleImageUpload } = useRichTextEditor({
    contentClassName: 'task-details-page__editor-content',
    onChange: (value) => setFormState((prev) => ({ ...prev, description: value })),
  })

  const applyTaskToForm = useCallback((taskData) => {
    const nextDescription = taskData.description || ''
    setFormState({
      name: taskData.name || '',
      description: nextDescription,
      startDate: taskData.start_date || '',
      dueDate: taskData.due_date || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      labelsInput: labelsToInput(taskData.labels),
      dependencyIds: normalizeDependencyIds(taskData.dependency_ids),
      subtasks: normalizeSubtasks(taskData.subtasks),
      assignedUserId: taskData.assigned_user_id ? String(taskData.assigned_user_id) : '',
    })
    if (editor) {
      editor.commands.setContent(nextDescription, { emitUpdate: false })
      editor.commands.setFontFamily('Segoe UI')
      setEditorFontFamily('Segoe UI')
    }
  }, [editor, setEditorFontFamily])

  useEffect(() => {
    const load = async () => {
      try {
        const [taskData, memberData, taskList] = await Promise.all([
          tasksApi.getTask(projectIdNumber, taskIdNumber),
          projectsApi.getProjectMembers(projectIdNumber),
          tasksApi.getTasks(projectIdNumber),
        ])
        setTask(taskData)
        setProjectTasks(taskList)
        setMembers(memberData)
        applyTaskToForm(taskData)
      } catch (error) {
        toast.error(getApiErrorDetails(error, 'Could not load task').message)
      }
    }

    void load()
  }, [applyTaskToForm, projectIdNumber, taskIdNumber])

  const dependencyOptions = useMemo(
    () => projectTasks.filter((projectTask) => projectTask.id !== taskIdNumber),
    [projectTasks, taskIdNumber],
  )

  const dependencyNameMap = useMemo(() => {
    const map = new Map()
    projectTasks.forEach((projectTask) => map.set(projectTask.id, projectTask.name))
    return map
  }, [projectTasks])

  const statusLabel = getStatusLabel(task?.status || formState.status)
  const priorityLabel = PRIORITY_LABELS[task?.priority || formState.priority] || 'Medium'
  const activeLabels = parseLabelsInput(task ? labelsToInput(task.labels) : formState.labelsInput)
  const assigneeName =
    task?.assignee?.name ||
    members.find((member) => String(member.id) === formState.assignedUserId)?.name ||
    'No one'
  const creatorName = task?.creator?.name || 'Unknown'
  const progress = getSubtaskProgress(task?.subtasks || formState.subtasks)
  const dueInfo = getDueInfo(task?.due_date || formState.dueDate)
  const createdAtLabel = task?.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'

  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleDependencyChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
    handleFieldChange('dependencyIds', normalizeDependencyIds(values))
  }

  const updateSubtask = (index, next) => {
    handleFieldChange(
      'subtasks',
      formState.subtasks.map((subtask, itemIndex) => (itemIndex === index ? { ...subtask, ...next } : subtask)),
    )
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (formState.startDate && formState.dueDate && formState.dueDate < formState.startDate) {
      toast.error('Due date must be after start date')
      return
    }

    try {
      const updated = await tasksApi.updateTask(projectIdNumber, taskIdNumber, {
        name: formState.name,
        description: formState.description,
        start_date: formState.startDate || undefined,
        due_date: formState.dueDate || undefined,
        status: formState.status,
        priority: formState.priority,
        labels: parseLabelsInput(formState.labelsInput),
        subtasks: normalizeSubtasks(formState.subtasks),
        dependency_ids: normalizeDependencyIds(formState.dependencyIds),
        assigned_user_id: formState.assignedUserId ? Number(formState.assignedUserId) : null,
      })

      setTask(updated)
      setProjectTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      applyTaskToForm(updated)
      setIsEditing(false)
      toast.success('Task updated')
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Could not update task').message)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    try {
      await tasksApi.deleteTask(projectIdNumber, task.id)
      toast.success('Task deleted')
      navigate(`/projects/${projectIdNumber}`)
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Could not delete task').message)
    }
  }

  const applyLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter link URL', previousUrl)
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url.trim() }).run()
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      if (src) {
        editor.chain().focus().setImage({ src, alt: file.name }).run()
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const updateSubtask = (index, next) => {
    setSubtasks((prev) =>
      prev.map((subtask, itemIndex) => (itemIndex === index ? { ...subtask, ...next } : subtask)),
    )
  }

  const addSubtask = () => {
    setSubtasks((prev) => [...prev, { title: '', done: false }])
  }

  const removeSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleDependencyChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
    setDependencyIds(normalizeDependencyIds(values))
  }

  const statusLabel = getStatusLabel(task?.status || status)
  const priorityLabel = PRIORITY_LABELS[task?.priority || priority] || 'Medium'
  const activeLabels = parseLabelsInput(task ? labelsToInput(task.labels) : labelsInput)
  const assigneeName =
    task?.assignee?.name ||
    members.find((member) => String(member.id) === assignedUserId)?.name ||
    'No one'
  const creatorName = task?.creator?.name || 'Unknown'
  const progress = getSubtaskProgress(task?.subtasks || subtasks)

  const getDueInfo = () => {
    const rawDueDate = task?.due_date || dueDate
    if (!rawDueDate) {
      return { label: 'No due date', tone: 'neutral' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(`${rawDueDate}T00:00:00`)
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

    if (diffDays > 0) {
      return { label: `${diffDays} day(s) remaining`, tone: 'good' }
    }
    if (diffDays === 0) {
      return { label: 'Due today', tone: 'warn' }
    }
    return { label: `${Math.abs(diffDays)} day(s) overdue`, tone: 'danger' }
  }

  const dueInfo = getDueInfo()
  const createdAtLabel = task?.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'
  const safeDescription = useMemo(() => sanitizeHtml(task?.description || ''), [task?.description])

  return (
    <div className="task-details-page">
      <Navbar />
      <main className="task-details-page__main">
        <div className="task-details-page__header">
          <h1 className="task-details-page__title">Task Details</h1>
          <div className="task-details-page__header-actions">
            <button type="button" className="task-details-page__secondary" onClick={() => navigate(`/projects/${projectIdNumber}`)}>
              Back to project
            </button>
            {!isEditing && (
              <>
                <button type="button" className="task-details-page__delete" onClick={() => void handleDelete()}>
                  Delete task
                </button>
                <button type="button" className="task-details-page__save" onClick={() => setIsEditing(true)}>
                  Edit task
                </button>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <section className="task-details-page__view">
            <aside className="task-details-page__form-sidebar">
              <div className="task-details-page__sidebar-card">
                <p className="task-details-page__field-label">Assignee</p>
                <div className="task-details-page__assignee-preview">
                  <div className="task-details-page__avatar-placeholder" aria-hidden="true">
                    {assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <p className="task-details-page__assignee-name">{assigneeName}</p>
                </div>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Created by</p>
                <p className="task-details-page__value">{creatorName}</p>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Created at</p>
                <p className="task-details-page__value">{createdAtLabel}</p>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Status</p>
                <span className="task-details-page__status-badge">{statusLabel}</span>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Priority</p>
                <p className="task-details-page__value">{priorityLabel}</p>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Timeline</p>
                <p className="task-details-page__value">Start: {task?.start_date || 'N/A'}</p>
                <p className={`task-details-page__due task-details-page__due--${dueInfo.tone}`}>
                  Due: {task?.due_date || 'N/A'} ({dueInfo.label})
                </p>
              </div>

              <div className="task-details-page__sidebar-row">
                <p className="task-details-page__field-label">Dependencies</p>
                <p className="task-details-page__value">
                  {(task?.dependency_ids || []).length
                    ? (task?.dependency_ids || [])
                        .map((id) => `#${id} ${dependencyNameMap.get(id) || 'Unknown task'}`)
                        .join(', ')
                    : 'None'}
                </p>
              </div>
            </aside>

            <div className="task-details-page__view-main">
              <section className="task-details-page__content-card">
                <h2 className="task-details-page__task-name">{task?.name || name || 'Task'}</h2>

                <div className="task-details-page__labels">
                  {activeLabels.length === 0 && <span className="task-details-page__label-chip">No labels</span>}
                  {activeLabels.map((label) => (
                    <span key={label} className="task-details-page__label-chip">
                      #{label}
                    </span>
                  ))}
                </div>

                <div className="task-details-page__subtask-progress">
                  <div className="task-details-page__subtask-progress-head">
                    <span>Subtasks progress</span>
                    <span>
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div className="task-details-page__subtask-progress-track">
                    <span className="task-details-page__subtask-progress-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>

                <ul className="task-details-page__subtask-list">
                  {(task?.subtasks || []).map((subtask, index) => (
                    <li key={`view-subtask-${index}`} className="task-details-page__subtask-item">
                      <input type="checkbox" checked={Boolean(subtask.done)} disabled />
                      <span>{subtask.title}</span>
                    </li>
                  ))}
                </ul>

                <div className="task-details-page__content">
                  {safeDescription ? (
                    <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
                  ) : (
                    <p>No description</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {isEditing && (
          <TaskDetailsEditForm
            formState={formState}
            members={members}
            dependencyOptions={dependencyOptions}
            onFieldChange={handleFieldChange}
            onDependencyChange={handleDependencyChange}
            onAddSubtask={() => handleFieldChange('subtasks', [...formState.subtasks, { title: '', done: false }])}
            onUpdateSubtask={updateSubtask}
            onRemoveSubtask={(index) =>
              handleFieldChange(
                'subtasks',
                formState.subtasks.filter((_, itemIndex) => itemIndex !== index),
              )
            }
            onCancel={() => setIsEditing(false)}
            onDelete={() => void handleDelete()}
            onSubmit={handleSave}
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
        )}
      </main>
    </div>
  )
}
