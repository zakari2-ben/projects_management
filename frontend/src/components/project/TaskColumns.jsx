import TaskCard from '../TaskCard'

export default function TaskColumns({
  columns,
  groupedTasks,
  projectId,
  onQuickMove,
  onDeleteTask,
  totalTasks,
  shownTasks,
}) {
  return (
    <section className="project-details-page__columns">
      <p className="project-details-page__results">
        Showing {shownTasks} of {totalTasks} tasks
      </p>
      {columns.map((column) => (
        <div key={column.key} className="project-details-page__column">
          <h3 className="project-details-page__column-title">{column.title}</h3>
          <div className="project-details-page__task-list">
            {groupedTasks[column.key].length === 0 && (
              <p className="project-details-page__column-empty">No tasks in this column</p>
            )}
            {groupedTasks[column.key].map((task) => (
              <div key={task.id}>
                <TaskCard projectId={projectId} task={task} onDelete={onDeleteTask} />
                <div className="project-details-page__move-actions">
                  {columns
                    .filter((item) => item.key !== task.status)
                    .map((target) => (
                      <button
                        key={target.key}
                        type="button"
                        onClick={() => void onQuickMove(task, target.key)}
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
  )
}
