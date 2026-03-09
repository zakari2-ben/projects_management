import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
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
  const location = useLocation()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('todo')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [editorFontFamily, setEditorFontFamily] = useState('Segoe UI')
  const [isEditing, setIsEditing] = useState(Boolean(location.state?.editMode))

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: '',
    onUpdate: ({ editor: currentEditor }) => {
      setDescription(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'task-details-page__editor-content',
      },
    },
  })

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
        const initialDescription = taskData.description || ''
        setDescription(initialDescription)
        setDueDate(taskData.due_date || '')
        setStatus(taskData.status || 'todo')
        // Keep select value as string for controlled <select>.
        setAssignedUserId(taskData.assigned_user_id ? String(taskData.assigned_user_id) : '')
        if (editor) {
          editor.commands.setContent(initialDescription, { emitUpdate: false })
          editor.commands.setFontFamily('Segoe UI')
          setEditorFontFamily('Segoe UI')
        }
      } catch {
        toast.error('Could not load task')
      }
    }

    void load()
  }, [editor, projectIdNumber, taskIdNumber])

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
      const nextDescription = updated.description || ''
      setDescription(nextDescription)
      if (editor) {
        editor.commands.setContent(nextDescription, { emitUpdate: false })
      }
      setIsEditing(false)
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

  const statusLabel = statuses.find((item) => item.value === (task?.status || status))?.label || 'To Do'
  const assigneeName =
    task?.assignee?.name ||
    members.find((member) => String(member.id) === assignedUserId)?.name ||
    'No one'
  const creatorName = task?.creator?.name || 'Unknown'

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

  return (
    <div className="task-details-page">
      <Navbar />
      <main className="task-details-page__main">
        <div className="task-details-page__header">
          <h1 className="task-details-page__title">Task Details</h1>
          <div className="task-details-page__header-actions">
            <button
              type="button"
              className="task-details-page__secondary"
              onClick={() => navigate(`/projects/${projectIdNumber}`)}
            >
              Back to project
            </button>
            {!isEditing && (
              <>
                <button
                  type="button"
                  className="task-details-page__delete"
                  onClick={() => void handleDelete()}
                >
                  Delete task
                </button>
                <button
                  type="button"
                  className="task-details-page__save"
                  onClick={() => setIsEditing(true)}
                >
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
                <p className="task-details-page__field-label">Deadline</p>
                <p className={`task-details-page__due task-details-page__due--${dueInfo.tone}`}>
                  {dueInfo.label}
                </p>
              </div>
            </aside>

            <div className="task-details-page__view-main">
              <section className="task-details-page__content-card">
                <h2 className="task-details-page__task-name">{task?.name || name || 'Task'}</h2>
                <div className="task-details-page__content">
                  {task?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: task.description }} />
                  ) : (
                    <p>No description</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {isEditing && (
          <form onSubmit={handleSave} className="task-details-page__form">
            <aside className="task-details-page__form-sidebar">
              <div className="task-details-page__sidebar-card">
                <p className="task-details-page__field-label">Assigned to</p>
                <div className="task-details-page__assignee-preview">
                  <div className="task-details-page__avatar-placeholder" aria-hidden="true">
                    {members
                      .find((member) => String(member.id) === assignedUserId)
                      ?.name?.charAt(0)
                      ?.toUpperCase() || 'N'}
                  </div>
                  <p className="task-details-page__assignee-name">
                    {members.find((member) => String(member.id) === assignedUserId)?.name || 'No one'}
                  </p>
                </div>
                <select
                  value={assignedUserId}
                  onChange={(event) => setAssignedUserId(event.target.value)}
                  className="task-details-page__input"
                >
                  <option value="">No one</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="task-details-page__sidebar-row">
                <label htmlFor="task-due-date" className="task-details-page__field-label">
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="task-details-page__input"
                />
              </div>

              <div className="task-details-page__sidebar-row">
                <label htmlFor="task-status" className="task-details-page__field-label">
                  Status
                </label>
                <select
                  id="task-status"
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
              </div>
            </aside>

            <div className="task-details-page__form-main">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="task-details-page__input"
                placeholder="Task name"
                required
              />

              <div className="task-details-page__editor">
                <div className="task-details-page__editor-toolbar">
                  <select
                    value={editorFontFamily}
                    onChange={(event) => {
                      const family = event.target.value
                      setEditorFontFamily(family)
                      editor?.chain().focus().setFontFamily(family).run()
                    }}
                    className="task-details-page__toolbar-select"
                  >
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    className="task-details-page__toolbar-button"
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  >
                    Code
                  </button>
                  <button type="button" className="task-details-page__toolbar-button" onClick={applyLink}>
                    Link
                  </button>
                  <label className="task-details-page__toolbar-button task-details-page__toolbar-upload">
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="task-details-page__file-input"
                    />
                  </label>
                </div>
                <EditorContent editor={editor} />
              </div>

              <div className="task-details-page__actions">
                <button
                  type="button"
                  className="task-details-page__secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="task-details-page__delete"
                >
                  Delete task
                </button>
                <button type="submit" className="task-details-page__save">
                  Save changes
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
