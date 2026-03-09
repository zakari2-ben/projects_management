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
  const [editorFontFamily, setEditorFontFamily] = useState('Segoe UI')

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
        class: 'project-details-page__editor-content',
      },
    },
  })

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
      editor?.commands.clearContent()
      editor?.commands.setFontFamily('Segoe UI')
      setEditorFontFamily('Segoe UI')
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
      toast.error('Could not move task')
    }
  }

  const handleDeleteTask = async (task) => {
    const confirmDelete = window.confirm(`Delete "${task.name}"?`)
    if (!confirmDelete) return

    try {
      await tasksApi.deleteTask(id, task.id)
      setTasks((prev) => prev.filter((item) => item.id !== task.id))
      toast.success('Task deleted')
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

              <div className="project-details-page__submit-row">
                <button type="submit" className="project-details-page__submit">
                  Create task
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="project-details-page__columns">
          {columns.map((column) => (
            <div key={column.key} className="project-details-page__column">
              <h3 className="project-details-page__column-title">{column.title}</h3>
              <div className="project-details-page__task-list">
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
