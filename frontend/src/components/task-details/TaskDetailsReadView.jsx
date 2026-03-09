export default function TaskDetailsReadView({
  task,
  name,
  creatorName,
  createdAtLabel,
  assigneeName,
  statusLabel,
  priorityLabel,
  dueInfo,
  dependencyNameMap,
  activeLabels,
  progress,
}) {
  return (
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
          <p className="task-details-page__field-label">Priority</p>
          <p className="task-details-page__value">{priorityLabel}</p>
        </div>

        <div className="task-details-page__sidebar-row">
          <p className="task-details-page__field-label">Timeline</p>
          <p className="task-details-page__value">Start: {task?.start_date || 'N/A'}</p>
          <p className={`task-details-page__due task-details-page__due--${dueInfo.tone}`}>
            Due: {task?.due_date || 'N/A'} ({dueInfo.label})
          </p>
        </div>

        <div className="task-details-page__sidebar-row">
          <p className="task-details-page__field-label">Dependencies</p>
          <p className="task-details-page__value">
            {(task?.dependency_ids || []).length
              ? (task?.dependency_ids || [])
                  .map((id) => `#${id} ${dependencyNameMap.get(id) || 'Unknown task'}`)
                  .join(', ')
              : 'None'}
          </p>
        </div>
      </aside>

      <div className="task-details-page__view-main">
        <section className="task-details-page__content-card">
          <h2 className="task-details-page__task-name">{task?.name || name || 'Task'}</h2>

          <div className="task-details-page__labels">
            {activeLabels.length === 0 && <span className="task-details-page__label-chip">No labels</span>}
            {activeLabels.map((label) => (
              <span key={label} className="task-details-page__label-chip">
                #{label}
              </span>
            ))}
          </div>

          <div className="task-details-page__subtask-progress">
            <div className="task-details-page__subtask-progress-head">
              <span>Subtasks progress</span>
              <span>
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="task-details-page__subtask-progress-track">
              <span className="task-details-page__subtask-progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          <ul className="task-details-page__subtask-list">
            {(task?.subtasks || []).map((subtask, index) => (
              <li key={`view-subtask-${index}`} className="task-details-page__subtask-item">
                <input type="checkbox" checked={Boolean(subtask.done)} disabled />
                <span>{subtask.title}</span>
              </li>
            ))}
          </ul>

          <div className="task-details-page__content">
            {task?.description ? <div dangerouslySetInnerHTML={{ __html: task.description }} /> : <p>No description</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
