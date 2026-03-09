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
import {
  normalizeDependencyIds,
  normalizeSubtasks,
  parseLabelsInput,
  PRIORITY_OPTIONS,
} from '../utils/taskFields'
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
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [labelsInput, setLabelsInput] = useState('')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [selectedDependencyIds, setSelectedDependencyIds] = useState([])
  const [subtasks, setSubtasks] = useState([])
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

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === 'todo'),
      in_progress: tasks.filter((task) => task.status === 'in_progress'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks],
  )

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
        toast.error(error?.response?.data?.message || 'Could not load project details')
      }
    }

    void load()
  }, [id])

  const handleCreateTask = async (event) => {
    event.preventDefault()

    if (startDate && dueDate && dueDate < startDate) {
      toast.error('Due date must be after start date')
      return
    }

    try {
      const payload = {
        name,
        description,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
        priority,
        labels: parseLabelsInput(labelsInput),
        subtasks: normalizeSubtasks(subtasks),
        dependency_ids: normalizeDependencyIds(selectedDependencyIds),
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      }

      const newTask = await tasksApi.createTask(id, payload)
      setTasks((prev) => [newTask, ...prev])
      setName('')
      setDescription('')
      setStartDate('')
      setDueDate('')
      setPriority('medium')
      setLabelsInput('')
      setAssignedUserId('')
      setSelectedDependencyIds([])
      setSubtasks([])
      editor?.commands.clearContent()
      editor?.commands.setFontFamily('Segoe UI')
      setEditorFontFamily('Segoe UI')
      toast.success('Task created')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not create task')
    }
  }

  const quickMove = async (task, status) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status)
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)))
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
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete task')
    }
  }

  const addSubtask = () => {
    setSubtasks((prev) => [...prev, { title: '', done: false }])
  }

  const updateSubtask = (index, next) => {
    setSubtasks((prev) =>
      prev.map((subtask, itemIndex) => (itemIndex === index ? { ...subtask, ...next } : subtask)),
    )
  }

  const removeSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleDependencyChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
    setSelectedDependencyIds(normalizeDependencyIds(values))
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
