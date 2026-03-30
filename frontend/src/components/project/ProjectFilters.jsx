import { PRIORITY_OPTIONS } from '../../utils/taskFields'

export default function ProjectFilters({
  columns,
  members,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  onClear,
}) {
  return (
    <section className="project-details-page__filters">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="project-details-page__input"
        placeholder="Search tasks by title, description, label or assignee"
      />
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="project-details-page__input"
      >
        <option value="all">All statuses</option>
        {columns.map((column) => (
          <option key={column.key} value={column.key}>
            {column.title}
          </option>
        ))}
      </select>
      <select
        value={priorityFilter}
        onChange={(event) => setPriorityFilter(event.target.value)}
        className="project-details-page__input"
      >
        <option value="all">All priorities</option>
        {PRIORITY_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select
        value={assigneeFilter}
        onChange={(event) => setAssigneeFilter(event.target.value)}
        className="project-details-page__input"
      >
        <option value="all">All assignees</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <button type="button" className="project-details-page__clear-filters" onClick={onClear}>
        Clear filters
      </button>
    </section>
  )
}
