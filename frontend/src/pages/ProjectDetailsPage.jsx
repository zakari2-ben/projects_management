import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import KpiCard from '../components/KpiCard'
import Navbar from '../components/Navbar'
import ProjectCollaborationPanel from '../components/ProjectCollaborationPanel'
import ProjectCreateTaskSection from '../components/project-details/ProjectCreateTaskSection'
import ProjectTaskBoard from '../components/project-details/ProjectTaskBoard'
import { useAuth } from '../context/AuthContext'
import { useRichTextEditor } from '../hooks/useRichTextEditor'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  normalizeDependencyIds,
  normalizeSubtasks,
  parseLabelsInput,
  PRIORITY_OPTIONS,
} from '../utils/taskFields'
import { getApiErrorDetails } from '../utils/http'
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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [labelsInput, setLabelsInput] = useState('')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [selectedDependencyIds, setSelectedDependencyIds] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [editorFontFamily, setEditorFontFamily] = useState('Segoe UI')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const debouncedSearch = useDebouncedValue(search, 280)

  const { editor, editorFontFamily, setEditorFontFamily, applyLink, handleImageUpload, resetEditor } =
    useRichTextEditor({
      contentClassName: 'project-details-page__editor-content',
      onChange: (value) => setFormState((prev) => ({ ...prev, description: value })),
    })

  const filteredTasks = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      if (assigneeFilter !== 'all' && String(task.assigned_user_id || '') !== assigneeFilter) return false

      if (!query) return true

      return [task.name, task.description, task.assignee?.name, ...(task.labels || [])]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .replace(/<[^>]*>/g, ' ')
            .toLowerCase()
            .includes(query),
        )
    })
  }, [assigneeFilter, debouncedSearch, priorityFilter, statusFilter, tasks])

  const groupedTasks = useMemo(
    () => ({
      todo: filteredTasks.filter((task) => task.status === 'todo'),
      in_progress: filteredTasks.filter((task) => task.status === 'in_progress'),
      done: filteredTasks.filter((task) => task.status === 'done'),
    }),
    [filteredTasks],
  )

  const taskStats = useMemo(() => {
    const overdue = tasks.filter((task) => task.is_overdue).length
    const done = tasks.filter((task) => task.status === 'done').length
    const blocked = tasks.filter((task) => Array.isArray(task.dependency_ids) && task.dependency_ids.length > 0).length

    return {
      total: tasks.length,
      done,
      overdue,
      blocked,
      completionRate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const dependencyOptions = useMemo(
    () => tasks.map((task) => ({ id: task.id, name: task.name })),
    [tasks],
  )

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
        toast.error(getApiErrorDetails(error, 'Could not load project details').message)
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
      toast.error(getApiErrorDetails(error, 'Could not create task').message)
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
      toast.error(getApiErrorDetails(error, 'Could not move task').message)
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
      toast.error(getApiErrorDetails(error, 'Could not delete task').message)
    }
  }

  const handleDependencyChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
    handleFormField('selectedDependencyIds', normalizeDependencyIds(values))
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setAssigneeFilter('all')
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

  return (
    <div className="project-details-page">
      <Navbar />
      <main className="project-details-page__main">
        <h1 className="project-details-page__title">{project?.name || 'Project'}</h1>
        <p className="project-details-page__description">{project?.description || 'No description'}</p>
        <p className="project-details-page__invite">Invite code: {project?.invite_code}</p>

        <section className="project-details-page__kpis">
          <KpiCard label="Total Tasks" value={taskStats.total} />
          <KpiCard label="Done" value={taskStats.done} tone="good" />
          <KpiCard label="Blocked" value={taskStats.blocked} />
          <KpiCard label="Overdue" value={taskStats.overdue} tone="danger" />
          <KpiCard label="Completion" value={`${taskStats.completionRate}%`} />
        </section>

        <section className="project-details-page__filters">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="project-details-page__input"
            placeholder="Search tasks by title, description, label or assignee"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="project-details-page__input"
          >
            <option value="all">All statuses</option>
            {columns.map((column) => (
              <option key={column.key} value={column.key}>
                {column.title}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="project-details-page__input"
          >
            <option value="all">All priorities</option>
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="project-details-page__input"
          >
            <option value="all">All assignees</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button type="button" className="project-details-page__clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        </section>

        <section className="project-details-page__create-task">
          <h2 className="project-details-page__section-title">Create task</h2>
          <form onSubmit={handleCreateTask} className="project-details-page__form">
            <aside className="project-details-page__form-sidebar">
              <div className="project-details-page__sidebar-card">
                <p className="project-details-page__field-label">Assigned to</p>
                <div className="project-details-page__assignee-preview">
                  <div className="project-details-page__avatar-placeholder" aria-hidden="true">
                    {members
                      .find((member) => String(member.id) === assignedUserId)
                      ?.name?.charAt(0)
                      ?.toUpperCase() || 'N'}
                  </div>
                  <div>
                    <p className="project-details-page__assignee-name">
                      {members.find((member) => String(member.id) === assignedUserId)?.name || 'No one'}
                    </p>
                  </div>
                </div>
                <select
                  value={assignedUserId}
                  onChange={(event) => setAssignedUserId(event.target.value)}
                  className="project-details-page__input"
                >
                  <option value="">No one</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="project-details-page__sidebar-row">
                <label htmlFor="task-priority" className="project-details-page__field-label">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="project-details-page__input"
                >
                  {PRIORITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="project-details-page__sidebar-row">
                <label htmlFor="task-start-date" className="project-details-page__field-label">
                  Start date
                </label>
                <input
                  id="task-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="project-details-page__input"
                />
              </div>

              <div className="project-details-page__sidebar-row">
                <label htmlFor="task-due-date" className="project-details-page__field-label">
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="project-details-page__input"
                />
              </div>

              <div className="project-details-page__sidebar-row">
                <label htmlFor="task-labels" className="project-details-page__field-label">
                  Labels (comma separated)
                </label>
                <input
                  id="task-labels"
                  type="text"
                  value={labelsInput}
                  onChange={(event) => setLabelsInput(event.target.value)}
                  className="project-details-page__input"
                  placeholder="backend, ui, bug"
                />
              </div>

              <div className="project-details-page__sidebar-row">
                <label htmlFor="task-dependencies" className="project-details-page__field-label">
                  Dependencies
                </label>
                <select
                  id="task-dependencies"
                  multiple
                  className="project-details-page__input project-details-page__input--multi"
                  value={selectedDependencyIds.map(String)}
                  onChange={handleDependencyChange}
                >
                  {dependencyOptions.length === 0 && <option value="">No tasks yet</option>}
                  {dependencyOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      #{option.id} {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            <div className="project-details-page__form-main">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Task name"
                className="project-details-page__input"
                required
              />

              <div className="project-details-page__editor">
                <div className="project-details-page__editor-toolbar">
                  <select
                    value={editorFontFamily}
                    onChange={(event) => {
                      const family = event.target.value
                      setEditorFontFamily(family)
                      editor?.chain().focus().setFontFamily(family).run()
                    }}
                    className="project-details-page__toolbar-select"
                  >
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  >
                    Code
                  </button>
                  <button
                    type="button"
                    className="project-details-page__toolbar-button"
                    onClick={applyLink}
                  >
                    Link
                  </button>
                  <label className="project-details-page__toolbar-button project-details-page__toolbar-upload">
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="project-details-page__file-input"
                    />
                  </label>
                </div>
                <EditorContent editor={editor} />
              </div>

              <section className="project-details-page__subtasks">
                <div className="project-details-page__subtasks-head">
                  <p className="project-details-page__field-label">Subtasks</p>
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="project-details-page__subtask-add"
                  >
                    Add subtask
                  </button>
                </div>
                {subtasks.length === 0 && <p className="project-details-page__subtasks-empty">No subtasks yet</p>}
                {subtasks.map((subtask, index) => (
                  <div key={`new-subtask-${index}`} className="project-details-page__subtask-row">
                    <input
                      type="checkbox"
                      checked={subtask.done}
                      onChange={(event) => updateSubtask(index, { done: event.target.checked })}
                    />
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(event) => updateSubtask(index, { title: event.target.value })}
                      className="project-details-page__input"
                      placeholder="Subtask title"
                    />
                    <button
                      type="button"
                      className="project-details-page__subtask-remove"
                      onClick={() => removeSubtask(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </section>

              <div className="project-details-page__submit-row">
                <button type="submit" className="project-details-page__submit">
                  Create task
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="project-details-page__columns">
          <p className="project-details-page__results">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
          {columns.map((column) => (
            <div key={column.key} className="project-details-page__column">
              <h3 className="project-details-page__column-title">{column.title}</h3>
              <div className="project-details-page__task-list">
                {groupedTasks[column.key].length === 0 && (
                  <p className="project-details-page__column-empty">No tasks in this column</p>
                )}
                {groupedTasks[column.key].map((task) => (
                  <div key={task.id}>
                    <TaskCard projectId={id} task={task} onDelete={handleDeleteTask} />
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
