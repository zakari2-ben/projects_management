export default function ProjectsHeader({ onOpenJoin, onOpenCreate }) {
  return (
    <div className="projects-page__header">
      <div>
        <h1 className="projects-page__title">Projects</h1>
        <p className="projects-page__subtitle">Keep all projects and members aligned in one place.</p>
      </div>
      <div className="projects-page__actions">
        <button
          type="button"
          onClick={onOpenJoin}
          className="projects-page__button projects-page__button--secondary"
        >
          Join project
        </button>
        <button
          type="button"
          onClick={onOpenCreate}
          className="projects-page__button projects-page__button--primary"
        >
          New project
        </button>
      </div>
    </div>
  )
}
