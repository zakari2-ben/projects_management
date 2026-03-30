export default function ProjectsFilters({ search, setSearch, sortBy, setSortBy }) {
  return (
    <section className="projects-page__filters">
      <input
        type="search"
        className="projects-page__input"
        placeholder="Search by name, invite code, owner..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="projects-page__input">
        <option value="recent">Sort: Most recent</option>
        <option value="name">Sort: Name A-Z</option>
        <option value="tasks">Sort: Most tasks</option>
      </select>
    </section>
  )
}
