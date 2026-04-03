import { EditorContent } from '@tiptap/react'
import { PRIORITY_OPTIONS } from '../../utils/taskFields'

export default function CreateTaskForm({
  isOpen,
  onToggle,
  onSubmit,
  members,
  assignedUserId,
  setAssignedUserId,
  priority,
  setPriority,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  labelsInput,
  setLabelsInput,
  dependencyOptions,
  selectedDependencyIds,
  handleDependencyChange,
  name,
  setName,
  editor,
  editorFontFamily,
  setEditorFontFamily,
  applyLink,
  handleImageUpload,
  subtasks,
  addSubtask,
  updateSubtask,
  removeSubtask,
}) {
  return (
    <section className="project-details-page__create-task">
      <div className="project-details-page__create-header">
        <h2 className="project-details-page__section-title">Create task</h2>
        <button
          type="button"
          className="project-details-page__toggle-create"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide form' : 'Create task'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={onSubmit} className="project-details-page__form">
          <aside className="project-details-page__form-sidebar">
            <div className="project-details-page__sidebar-card">
              <p className="project-details-page__field-label">Assigned to</p>
              <div className="project-details-page__assignee-preview">
                <div className="project-details-page__avatar-placeholder" aria-hidden="true">
                  {members.find((member) => String(member.id) === assignedUserId)?.name?.charAt(0)?.toUpperCase() || 'N'}
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
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Sora">Sora</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
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
                <button type="button" className="project-details-page__toolbar-button" onClick={applyLink}>
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
                <button type="button" onClick={addSubtask} className="project-details-page__subtask-add">
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
      )}
    </section>
  )
}
