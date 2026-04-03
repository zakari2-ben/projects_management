import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import KpiCard from '../components/KpiCard'
import Navbar from '../components/Navbar'
import ProjectFilters from '../components/project/ProjectFilters'
import CreateTaskForm from '../components/project/CreateTaskForm'
import TaskColumns from '../components/project/TaskColumns'
import TaskGantt from '../components/project/TaskGantt'
import * as projectsApi from '../api/projects.api'
import * as tasksApi from '../api/tasks.api'
import { useNotifications } from '../context/NotificationContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  normalizeDependencyIds,
  normalizeSubtasks,
  parseLabelsInput,
} from '../utils/taskFields'
import { getApiErrorDetails } from '../utils/http'
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [viewMode, setViewMode] = useState('board')
  const debouncedSearch = useDebouncedValue(search, 280)
  const { refresh: refreshNotifications } = useNotifications()

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
        refreshNotifications()
      } catch (error) {
        toast.error(getApiErrorDetails(error, 'Could not load project details').message)
      }
    }

    void load()
  }, [id, refreshNotifications])

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
      refreshNotifications()
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
      setIsCreateTaskOpen(false)
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Could not create task').message)
    }
  }

  const quickMove = async (task, status) => {
    try {
      const updated = await tasksApi.updateTaskStatus(id, task.id, status)
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)))
      refreshNotifications()
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
      refreshNotifications()
      toast.success('Task deleted')
    } catch (error) {
      toast.error(getApiErrorDetails(error, 'Could not delete task').message)
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

        <ProjectFilters
          columns={columns}
          members={members}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          onClear={clearFilters}
        />

        <CreateTaskForm
          isOpen={isCreateTaskOpen}
          onToggle={() => setIsCreateTaskOpen((prev) => !prev)}
          onSubmit={handleCreateTask}
          members={members}
          assignedUserId={assignedUserId}
          setAssignedUserId={setAssignedUserId}
          priority={priority}
          setPriority={setPriority}
          startDate={startDate}
          setStartDate={setStartDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          labelsInput={labelsInput}
          setLabelsInput={setLabelsInput}
          dependencyOptions={dependencyOptions}
          selectedDependencyIds={selectedDependencyIds}
          handleDependencyChange={handleDependencyChange}
          name={name}
          setName={setName}
          editor={editor}
          editorFontFamily={editorFontFamily}
          setEditorFontFamily={setEditorFontFamily}
          applyLink={applyLink}
          handleImageUpload={handleImageUpload}
          subtasks={subtasks}
          addSubtask={addSubtask}
          updateSubtask={updateSubtask}
          removeSubtask={removeSubtask}
        />

        <div className="project-details-page__view-bar">
          <div className="project-details-page__view-text">
            <p className="project-details-page__results">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
            <p className="project-details-page__view-hint">Filters apply to both Board and Gantt views.</p>
          </div>
          <div className="project-details-page__view-toggle" role="tablist" aria-label="Task view">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'board'}
              className={`project-details-page__view-tab ${viewMode === 'board' ? 'is-active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              Board
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'gantt'}
              className={`project-details-page__view-tab ${viewMode === 'gantt' ? 'is-active' : ''}`}
              onClick={() => setViewMode('gantt')}
            >
              Gantt
            </button>
          </div>
        </div>

        {viewMode === 'board' ? (
          <TaskColumns columns={columns} groupedTasks={groupedTasks} projectId={id} onQuickMove={quickMove} onDeleteTask={handleDeleteTask} />
        ) : (
          <TaskGantt key={id} tasks={filteredTasks} projectId={id} />
        )}
      </main>
    </div>
  )
}
