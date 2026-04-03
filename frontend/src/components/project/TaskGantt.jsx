import { useEffect, useMemo, useState } from 'react'
import { getStatusLabel, PRIORITY_LABELS } from '../../utils/taskFields'
import '../../styles/components/TaskGantt.css'

const DAY_WIDTHS = {
  day: 72,
  week: 52,
  month: 34,
}
const ROW_HEIGHT = 70
const DAY_MS = 24 * 60 * 60 * 1000

const STATUS_COLORS = {
  todo: 'var(--status-todo)',
  in_progress: 'var(--status-in-progress)',
  done: 'var(--status-done)',
}

const PRIORITY_COLORS = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)',
  critical: 'var(--priority-critical)',
}

function startOfDay(date) {
  const copy = new Date(date.getTime())
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date, days) {
  const copy = new Date(date.getTime())
  copy.setDate(copy.getDate() + days)
  return copy
}

function parseDate(value) {
  if (!value) return null
  const parts = value.split('-').map((part) => Number(part))
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null
  const [year, month, day] = parts
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

function diffInDays(start, end) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS)
}

function buildDays(start, end) {
  const days = []
  let current = startOfDay(start)
  while (current.getTime() <= end.getTime()) {
    days.push(current)
    current = addDays(current, 1)
  }
  return days
}

function formatShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWeekday(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function getMonthLabel(day, index, days) {
  if (index === 0) return day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const prev = days[index - 1]
  if (prev.getMonth() !== day.getMonth()) {
    return day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return ''
}

export default function TaskGantt({ tasks, projectId }) {
  const storageKey = useMemo(() => (projectId ? `gantt-order-${projectId}` : null), [projectId])
  const today = useMemo(() => startOfDay(new Date()), [])
  const [manualOrder, setManualOrder] = useState(() => {
    if (!storageKey) return []
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Could not load gantt order', error)
      return []
    }
  })
  const [zoom, setZoom] = useState('day')

  const normalizedTasks = useMemo(
    () =>
      tasks.map((task) => {
        const start = parseDate(task.start_date) || parseDate(task.due_date)
        const end = parseDate(task.due_date) || parseDate(task.start_date)
        const safeEnd = start && end ? (end.getTime() < start.getTime() ? start : end) : end
        const hasSchedule = Boolean(start)
        const durationDays = start && safeEnd ? diffInDays(start, safeEnd) + 1 : null

        return {
          ...task,
          start,
          end: safeEnd || start,
          hasSchedule,
          statusLabel: getStatusLabel(task.status),
          priorityLabel: PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium,
          priorityColor: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium,
          durationLabel: durationDays ? `${durationDays} day${durationDays > 1 ? 's' : ''}` : '',
        }
      }),
    [tasks],
  )

  const orderedTasks = useMemo(() => {
    const map = new Map(normalizedTasks.map((task) => [task.id, task]))
    const baseOrder = manualOrder.length ? manualOrder : normalizedTasks.map((task) => task.id)

    const seen = new Set()
    const merged = [...baseOrder, ...normalizedTasks.map((task) => task.id)]
    return merged
      .filter((id) => map.has(id) && !seen.has(id) && seen.add(id))
      .map((id) => map.get(id))
  }, [manualOrder, normalizedTasks])

  useEffect(() => {
    if (!storageKey) return
    if (manualOrder.length === 0) {
      localStorage.removeItem(storageKey)
      return
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(manualOrder))
    } catch (error) {
      console.error('Could not save gantt order', error)
    }
  }, [manualOrder, storageKey])

  const moveTask = (taskId, direction) => {
    setManualOrder((prev) => {
      const current = prev.length ? [...prev] : orderedTasks.map((task) => task.id)
      const index = current.indexOf(taskId)
      if (index === -1) return current
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= current.length) return current
      ;[current[index], current[target]] = [current[target], current[index]]
      return current
    })
  }

  const resetOrder = () => {
    setManualOrder([])
  }

  const timeline = useMemo(() => {
    const datedTasks = orderedTasks.filter((task) => task.hasSchedule && task.start)
    const dates = datedTasks.flatMap((task) => [task.start, task.end].filter(Boolean))

    if (dates.length === 0) {
      const baseStart = addDays(today, -3)
      const baseEnd = addDays(today, 7)
      return { start: baseStart, end: baseEnd }
    }

    const minDate = dates.reduce((min, date) => (date.getTime() < min.getTime() ? date : min), dates[0])
    const maxDate = dates.reduce((max, date) => (date.getTime() > max.getTime() ? date : max), dates[0])

    const start = addDays(new Date(Math.min(minDate.getTime(), today.getTime())), -1)
    const end = addDays(new Date(Math.max(maxDate.getTime(), today.getTime())), 1)

    return { start: startOfDay(start), end: startOfDay(end) }
  }, [orderedTasks, today])

  const days = useMemo(() => buildDays(timeline.start, timeline.end), [timeline.end, timeline.start])

  const positionedTasks = useMemo(
    () =>
      orderedTasks.map((task) => {
        if (!task.hasSchedule || !task.start) {
          return { ...task, offset: null, span: null }
        }

        const offset = Math.max(0, diffInDays(timeline.start, task.start))
        const end = task.end || task.start
        const span = Math.max(1, diffInDays(task.start, end) + 1)

        return {
          ...task,
          offset,
          span,
          startLabel: task.start ? formatShort(task.start) : 'No start',
          endLabel: end ? formatShort(end) : 'No due',
        }
      }),
    [orderedTasks, timeline.start],
  )

  const todayIndex =
    today.getTime() >= timeline.start.getTime() && today.getTime() <= timeline.end.getTime()
      ? diffInDays(timeline.start, today)
      : null

  const dayWidth = DAY_WIDTHS[zoom] || DAY_WIDTHS.day
  const totalWidth = days.length * dayWidth
  const weekendIndices = useMemo(
    () => days.map((day, index) => (day.getDay() === 0 || day.getDay() === 6 ? index : null)).filter((i) => i !== null),
    [days],
  )

  return (
    <section className="task-gantt" style={{ '--day-width': `${dayWidth}px`, '--row-height': `${ROW_HEIGHT}px` }}>
      <div className="task-gantt__legend">
        <div className="task-gantt__legend-group">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="task-gantt__legend-item">
              <span className="task-gantt__legend-swatch" style={{ background: color }} />
              {getStatusLabel(status)}
            </span>
          ))}
        </div>
        <div className="task-gantt__legend-actions">
          <div className="task-gantt__legend-group task-gantt__legend-group--priority">
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <span key={priority} className="task-gantt__legend-item">
                <span className="task-gantt__priority-dot" style={{ background: color }} />
                {PRIORITY_LABELS[priority]}
              </span>
            ))}
          </div>
          <div className="task-gantt__zoom">
            {['day', 'week', 'month'].map((level) => (
              <button
                key={level}
                type="button"
                className={`task-gantt__zoom-btn ${zoom === level ? 'is-active' : ''}`}
                onClick={() => setZoom(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="task-gantt__frame">
        <div className="task-gantt__labels">
          <div className="task-gantt__labels-head">
            <span>Tasks (drag-free ordering)</span>
            <div className="task-gantt__order-actions">
              <button
                type="button"
                className="task-gantt__order-button"
                onClick={() => resetOrder()}
                disabled={!manualOrder.length}
              >
                Reset order
              </button>
            </div>
          </div>
          {positionedTasks.length === 0 ? (
            <div className="task-gantt__label task-gantt__label--empty">No tasks to show</div>
          ) : (
            positionedTasks.map((task) => (
              <div key={task.id ?? task.name} className="task-gantt__label">
                <div className="task-gantt__label-main">
                  <span className="task-gantt__priority-dot" style={{ background: task.priorityColor }} aria-hidden />
                  <span className="task-gantt__task-name">{task.name}</span>
                  <span className={`task-gantt__status task-gantt__status--${task.status || 'todo'}`}>
                    {task.statusLabel}
                  </span>
                  <div className="task-gantt__reorder">
                    <button
                      type="button"
                      aria-label="Move up"
                      onClick={() => moveTask(task.id, 'up')}
                      className="task-gantt__reorder-btn"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5l6 6h-4v8h-4v-8H6l6-6Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      onClick={() => moveTask(task.id, 'down')}
                      className="task-gantt__reorder-btn"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 19l-6-6h4V5h4v8h4l-6 6Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="task-gantt__label-meta">
                  <span>{task.start ? formatShort(task.start) : 'No start'}</span>
                  <span aria-hidden>&bull;</span>
                  <span>{task.end ? formatShort(task.end) : 'No due'}</span>
                  {task.assignee?.name ? (
                    <>
                      <span aria-hidden>&bull;</span>
                      <span>{task.assignee.name}</span>
                    </>
                  ) : null}
                  {task.hasSchedule ? (
                    <>
                      <span aria-hidden>&bull;</span>
                      <span>{task.durationLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="task-gantt__timeline">
          <div className="task-gantt__scroll">
            <div className="task-gantt__inner" style={{ width: `${totalWidth}px` }}>
              <div
                className="task-gantt__day-row"
                style={{ gridTemplateColumns: `repeat(${days.length}, var(--day-width))` }}
              >
                {days.map((day, index) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  return (
                    <div
                      key={day.toISOString()}
                      className={`task-gantt__day ${isWeekend ? 'task-gantt__day--weekend' : ''}`}
                    >
                      <span className="task-gantt__day-month">{getMonthLabel(day, index, days)}</span>
                      <span className="task-gantt__day-number">{day.getDate()}</span>
                      <span className="task-gantt__day-weekday">{formatWeekday(day)}</span>
                    </div>
                  )
                })}
              </div>

              <div
                className="task-gantt__bars"
                style={{
                  gridTemplateRows: `repeat(${Math.max(positionedTasks.length, 1)}, var(--row-height))`,
                }}
              >
                <div className="task-gantt__grid-lines" />
                {weekendIndices.map((index) => (
                  <div
                    key={`weekend-${index}`}
                    className="task-gantt__weekend-strip"
                    style={{ left: `${index * dayWidth}px`, width: `${dayWidth}px` }}
                  />
                ))}
                {todayIndex !== null ? (
                  <div className="task-gantt__today-line" style={{ left: `${todayIndex * dayWidth}px` }}>
                    <span>Today</span>
                  </div>
                ) : null}

                {positionedTasks.length === 0 ? (
                  <div className="task-gantt__bar-row task-gantt__bar-row--empty">
                    <span>Nothing to plot yet. Create tasks with dates to see the timeline.</span>
                  </div>
                ) : (
                  positionedTasks.map((task) => (
                    <div key={task.id ?? task.name} className="task-gantt__bar-row">
                      {!task.hasSchedule || task.offset === null ? (
                        <span className="task-gantt__no-dates">No start / due date</span>
                      ) : (
                        <div
                          className={`task-gantt__bar task-gantt__bar--status-${task.status || 'todo'} ${
                            task.is_overdue ? 'task-gantt__bar--overdue' : ''
                          }`}
                          style={{
                            left: `${task.offset * dayWidth}px`,
                            width: `max(${dayWidth * 0.85}px, ${task.span * dayWidth}px)`,
                            '--status-color': STATUS_COLORS[task.status] || STATUS_COLORS.todo,
                            '--priority-color': task.priorityColor,
                          }}
                          aria-label={`${task.name} (${task.startLabel} -> ${task.endLabel})`}
                        >
                          <span className="task-gantt__bar-title">{task.name}</span>
                          {task.is_overdue ? <span className="task-gantt__bar-tag">Overdue</span> : null}
                          <div className="task-gantt__tooltip">
                            <p className="task-gantt__tooltip-title">{task.name}</p>
                            <p>
                              <strong>Dates:</strong> {task.startLabel}
                              {' -> '}
                              {task.endLabel}
                            </p>
                            <p>
                              <strong>Status:</strong> {task.statusLabel}
                            </p>
                            <p>
                              <strong>Assignee:</strong> {task.assignee?.name || 'Unassigned'}
                            </p>
                            <p>
                              <strong>Priority:</strong> {task.priorityLabel}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
