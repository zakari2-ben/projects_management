import { PRIORITY_OPTIONS } from '../../utils/taskFields'
import { taskStatuses } from '../../utils/taskDetails/taskMeta'
import RichTextEditorField from '../shared/RichTextEditorField'

export default function TaskDetailsEditForm({
  formState,
  members,
  dependencyOptions,
  onFieldChange,
  onDependencyChange,
  onAddSubtask,
  onUpdateSubtask,
  onRemoveSubtask,
  onCancel,
  onDelete,
  onSubmit,
  editorProps,
}) {
  const { name, labelsInput, startDate, dueDate, status, priority, dependencyIds, assignedUserId, subtasks } = formState

  return (
    <form onSubmit={onSubmit} className="task-details-page__form">
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
            onChange={(event) => onFieldChange('assignedUserId', event.target.value)}
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
          <label htmlFor="task-status" className="task-details-page__field-label">
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(event) => onFieldChange('status', event.target.value)}
            className="task-details-page__input"
          >
            {taskStatuses.map((statusItem) => (
              <option key={statusItem.value} value={statusItem.value}>
                {statusItem.label}
              </option>
            ))}
          </select>
        </div>

        <div className="task-details-page__sidebar-row">
          <label htmlFor="task-priority" className="task-details-page__field-label">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => onFieldChange('priority', event.target.value)}
            className="task-details-page__input"
          >
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="task-details-page__sidebar-row">
          <label htmlFor="task-start-date" className="task-details-page__field-label">
            Start date
          </label>
          <input
            id="task-start-date"
            type="date"
            value={startDate}
            onChange={(event) => onFieldChange('startDate', event.target.value)}
            className="task-details-page__input"
          />
        </div>

        <div className="task-details-page__sidebar-row">
          <label htmlFor="task-due-date" className="task-details-page__field-label">
            Due date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => onFieldChange('dueDate', event.target.value)}
            className="task-details-page__input"
          />
        </div>

        <div className="task-details-page__sidebar-row">
          <label htmlFor="task-dependencies" className="task-details-page__field-label">
            Dependencies
          </label>
          <select
            id="task-dependencies"
            multiple
            className="task-details-page__input task-details-page__input--multi"
            value={dependencyIds.map(String)}
            onChange={onDependencyChange}
          >
            {dependencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                #{option.id} {option.name}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <div className="task-details-page__form-main">
        <input
          type="text"
          value={name}
          onChange={(event) => onFieldChange('name', event.target.value)}
          className="task-details-page__input"
          placeholder="Task name"
          required
        />

        <input
          type="text"
          value={labelsInput}
          onChange={(event) => onFieldChange('labelsInput', event.target.value)}
          className="task-details-page__input"
          placeholder="Labels: backend, ui, bug"
        />

        <RichTextEditorField classNamePrefix="task-details-page" {...editorProps} />

        <section className="task-details-page__subtasks-editor">
          <div className="task-details-page__subtasks-head">
            <p className="task-details-page__field-label">Subtasks</p>
            <button type="button" onClick={onAddSubtask} className="task-details-page__secondary">
              Add subtask
            </button>
          </div>
          {subtasks.map((subtask, index) => (
            <div key={`edit-subtask-${index}`} className="task-details-page__subtask-edit-row">
              <input
                type="checkbox"
                checked={subtask.done}
                onChange={(event) => onUpdateSubtask(index, { done: event.target.checked })}
              />
              <input
                type="text"
                className="task-details-page__input"
                value={subtask.title}
                onChange={(event) => onUpdateSubtask(index, { title: event.target.value })}
                placeholder="Subtask title"
              />
              <button type="button" className="task-details-page__delete" onClick={() => onRemoveSubtask(index)}>
                Remove
              </button>
            </div>
          ))}
        </section>

        <div className="task-details-page__actions">
          <button type="button" className="task-details-page__secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onDelete} className="task-details-page__delete">
            Delete task
          </button>
          <button type="submit" className="task-details-page__save">
            Save changes
          </button>
        </div>
      </div>
    </form>
  )
}
