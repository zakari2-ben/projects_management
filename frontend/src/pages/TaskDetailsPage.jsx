import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Navbar from '../components/Navbar'
import TaskDetailsView from '../components/task/TaskDetailsView'
import TaskDetailsForm from '../components/task/TaskDetailsForm'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import { useNotifications } from '../context/NotificationContext'
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
  const { refresh: refreshNotifications } = useNotifications()
  const [task, setTask] = useState(null)
  const [project, setProject] = useState(null)
  const [projectTasks, setProjectTasks] = useState([])
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState('medium')
  const [labelsInput, setLabelsInput] = useState('')
  const [dependencyIds, setDependencyIds] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [assignedUserId, setAssignedUserId] = useState('')
  const [editorFontFamily, setEditorFontFamily] = useState('Plus Jakarta Sans')
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
        const [taskData, memberData, taskList, projectData] = await Promise.all([
          tasksApi.getTask(projectIdNumber, taskIdNumber),
          projectsApi.getProjectMembers(projectIdNumber),
          tasksApi.getTasks(projectIdNumber),
          projectsApi.getProject(projectIdNumber),
        ])
        setTask(taskData)
        setProject(projectData)
        setProjectTasks(taskList)
        setMembers(memberData)
        setName(taskData.name)
        const initialDescription = taskData.description || ''
        setDescription(initialDescription)
        setStartDate(taskData.start_date || '')
        setDueDate(taskData.due_date || '')
        setStatus(taskData.status || 'todo')
        setPriority(taskData.priority || 'medium')
        setLabelsInput(labelsToInput(taskData.labels))
        setDependencyIds(normalizeDependencyIds(taskData.dependency_ids))
        setSubtasks(normalizeSubtasks(taskData.subtasks))
        setAssignedUserId(taskData.assigned_user_id ? String(taskData.assigned_user_id) : '')

        if (editor) {
          editor.commands.setContent(initialDescription, { emitUpdate: false })
          editor.commands.setFontFamily('Plus Jakarta Sans')
          setEditorFontFamily('Plus Jakarta Sans')
        }
        void refreshNotifications()
      } catch (error) {
        toast.error(getApiErrorDetails(error, 'Could not load task').message)
      }
    }

    void load()
  }, [editor, projectIdNumber, refreshNotifications, taskIdNumber])

  const dependencyOptions = useMemo(
    () => projectTasks.filter((projectTask) => projectTask.id !== taskIdNumber),
    [projectTasks, taskIdNumber],
  )

  const dependencyNameMap = useMemo(() => {
    const map = new Map()
    projectTasks.forEach((projectTask) => {
      map.set(projectTask.id, projectTask.name)
    })
    return map
  }, [projectTasks])

  const handleSave = async (event) => {
    event.preventDefault()

    if (startDate && dueDate && dueDate < startDate) {
      toast.error('Due date must be after start date')
      return
    }

    try {
      const updated = await tasksApi.updateTask(projectIdNumber, taskIdNumber, {
        name,
        description,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
        status,
        priority,
        labels: parseLabelsInput(labelsInput),
        subtasks: normalizeSubtasks(subtasks),
        dependency_ids: normalizeDependencyIds(dependencyIds),
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      })

      setTask(updated)
      const nextDescription = updated.description || ''
      setDescription(nextDescription)
      setStartDate(updated.start_date || '')
      setDueDate(updated.due_date || '')
      setStatus(updated.status || 'todo')
      setPriority(updated.priority || 'medium')
      setLabelsInput(labelsToInput(updated.labels))
      setDependencyIds(normalizeDependencyIds(updated.dependency_ids))
      setSubtasks(normalizeSubtasks(updated.subtasks))
      setAssignedUserId(updated.assigned_user_id ? String(updated.assigned_user_id) : '')
      setProjectTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      void refreshNotifications()

      if (editor) {
        editor.commands.setContent(nextDescription, { emitUpdate: false })
      }

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
          <TaskDetailsView
            task={task}
            name={name}
            dependencyNameMap={dependencyNameMap}
            dueInfo={dueInfo}
            statusLabel={statusLabel}
            priorityLabel={priorityLabel}
            activeLabels={activeLabels}
            progress={progress}
            safeDescription={safeDescription}
          />
        )}

        {isEditing && (
          <TaskDetailsForm
            statuses={statuses}
            members={members}
            dependencyOptions={dependencyOptions}
            editor={editor}
            editorFontFamily={editorFontFamily}
            setEditorFontFamily={setEditorFontFamily}
            applyLink={applyLink}
            handleImageUpload={handleImageUpload}
            name={name}
            setName={setName}
            labelsInput={labelsInput}
            setLabelsInput={setLabelsInput}
            assignedUserId={assignedUserId}
            setAssignedUserId={setAssignedUserId}
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
            startDate={startDate}
            setStartDate={setStartDate}
            dueDate={dueDate}
            setDueDate={setDueDate}
            dependencyIds={dependencyIds}
            handleDependencyChange={handleDependencyChange}
            subtasks={subtasks}
            addSubtask={addSubtask}
            updateSubtask={updateSubtask}
            removeSubtask={removeSubtask}
            onCancel={() => setIsEditing(false)}
            onDelete={() => void handleDelete()}
            onSubmit={handleSave}
          />
        )}
      </main>
    </div>
  )
}
