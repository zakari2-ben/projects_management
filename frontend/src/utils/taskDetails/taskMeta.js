export const taskStatuses = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function getDueInfo(rawDueDate) {
  if (!rawDueDate) return { label: 'No due date', tone: 'neutral' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(`${rawDueDate}T00:00:00`)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays > 0) return { label: `${diffDays} day(s) remaining`, tone: 'good' }
  if (diffDays === 0) return { label: 'Due today', tone: 'warn' }
  return { label: `${Math.abs(diffDays)} day(s) overdue`, tone: 'danger' }
}
