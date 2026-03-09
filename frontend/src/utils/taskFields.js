export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const PRIORITY_LABELS = PRIORITY_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

export function getStatusLabel(status) {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'done') return 'Done'
  return 'To Do'
}

export function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return []

  return Array.from(
    new Set(
      labels
        .map((label) => String(label || '').trim())
        .filter(Boolean),
    ),
  )
}

export function labelsToInput(labels) {
  return normalizeLabels(labels).join(', ')
}

export function parseLabelsInput(value) {
  if (!value.trim()) return []

  return normalizeLabels(value.split(','))
}

export function normalizeSubtasks(subtasks) {
  if (!Array.isArray(subtasks)) return []

  return subtasks
    .map((subtask) => ({
      title: String(subtask?.title || '').trim(),
      done: Boolean(subtask?.done),
    }))
    .filter((subtask) => subtask.title)
}

export function getSubtaskProgress(subtasks) {
  const normalized = normalizeSubtasks(subtasks)
  const total = normalized.length
  const done = normalized.filter((subtask) => subtask.done).length

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  }
}

export function normalizeDependencyIds(dependencyIds) {
  if (!Array.isArray(dependencyIds)) return []

  return Array.from(
    new Set(
      dependencyIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  )
}
