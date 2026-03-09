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
import { getDueInfo } from '../utils/taskDetails/taskMeta'
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
        toast.error(error?.response?.data?.message || 'Could not load task')
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
      toast.error(error?.response?.data?.message || 'Could not update task')
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
          <TaskDetailsReadView
            task={task}
            name={formState.name}
            creatorName={creatorName}
            createdAtLabel={createdAtLabel}
            assigneeName={assigneeName}
            statusLabel={statusLabel}
            priorityLabel={priorityLabel}
            dueInfo={dueInfo}
            dependencyNameMap={dependencyNameMap}
            activeLabels={activeLabels}
            progress={progress}
          />
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
