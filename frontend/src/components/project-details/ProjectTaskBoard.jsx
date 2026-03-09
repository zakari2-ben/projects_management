import TaskCard from '../TaskCard'

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

export default function ProjectTaskBoard({
  groupedTasks,
  projectId,
  commentCounts,
  onDeleteTask,
  onOpenComments,
  onMoveTask,
}) {
  return (
    <section className="project-details-page__columns">
      {columns.map((column) => (
        <div key={column.key} className="project-details-page__column">
          <h3 className="project-details-page__column-title">{column.title}</h3>
          <div className="project-details-page__task-list">
            {groupedTasks[column.key].map((task) => (
              <div key={task.id}>
                <TaskCard
                  projectId={projectId}
                  task={task}
                  onDelete={onDeleteTask}
                  commentsCount={commentCounts[String(task.id)] || 0}
                  onOpenComments={onOpenComments}
                />
                <div className="project-details-page__move-actions">
                  {columns
                    .filter((item) => item.key !== task.status)
                    .map((target) => (
                      <button
                        key={target.key}
                        type="button"
                        onClick={() => void onMoveTask(task, target.key)}
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
