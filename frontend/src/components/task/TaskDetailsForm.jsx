import { EditorContent } from '@tiptap/react'
import { PRIORITY_OPTIONS } from '../../utils/taskFields'

export default function TaskDetailsForm({
  statuses,
  members,
  dependencyOptions,
  editor,
  editorFontFamily,
  setEditorFontFamily,
  applyLink,
  handleImageUpload,
  name,
  setName,
  labelsInput,
  setLabelsInput,
  assignedUserId,
  setAssignedUserId,
  status,
  setStatus,
  priority,
  setPriority,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  dependencyIds,
  handleDependencyChange,
  subtasks,
  addSubtask,
  updateSubtask,
  removeSubtask,
  onCancel,
  onDelete,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="task-details-page__form">
      <aside className="task-details-page__form-sidebar">
        <div className="task-details-page__sidebar-card">
          <p className="task-details-page__field-label">Assigned to</p>
          <div className="task-details-page__assignee-preview">
            <div className="task-details-page__avatar-placeholder" aria-hidden="true">
              {members.find((member) => String(member.id) === assignedUserId)?.name?.charAt(0)?.toUpperCase() || 'N'}
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

        <div className="task-details-page__sidebar-row">
          <label htmlFor="task-priority" className="task-details-page__field-label">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
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
            onChange={(event) => setStartDate(event.target.value)}
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
            onChange={(event) => setDueDate(event.target.value)}
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
            onChange={handleDependencyChange}
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
          onChange={(event) => setName(event.target.value)}
          className="task-details-page__input"
          placeholder="Task name"
          required
        />

        <input
          type="text"
          value={labelsInput}
          onChange={(event) => setLabelsInput(event.target.value)}
          className="task-details-page__input"
          placeholder="Labels: backend, ui, bug"
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
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Sora">Sora</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
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

        <section className="task-details-page__subtasks-editor">
          <div className="task-details-page__subtasks-head">
            <p className="task-details-page__field-label">Subtasks</p>
            <button type="button" onClick={addSubtask} className="task-details-page__secondary">
              Add subtask
            </button>
          </div>
          {subtasks.map((subtask, index) => (
            <div key={`edit-subtask-${index}`} className="task-details-page__subtask-edit-row">
              <input
                type="checkbox"
                checked={subtask.done}
                onChange={(event) => updateSubtask(index, { done: event.target.checked })}
              />
              <input
                type="text"
                className="task-details-page__input"
                value={subtask.title}
                onChange={(event) => updateSubtask(index, { title: event.target.value })}
                placeholder="Subtask title"
              />
              <button type="button" className="task-details-page__delete" onClick={() => removeSubtask(index)}>
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
