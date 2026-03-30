import Modal from '../Modal'

export default function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  name,
  setName,
  description,
  setDescription,
  submitting,
}) {
  return (
    <Modal open={open} title="Create project" onClose={onClose}>
      <form onSubmit={onSubmit} className="projects-page__modal-form">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="projects-page__input"
          required
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          className="projects-page__textarea"
          rows={3}
        />
        <button type="submit" disabled={submitting} className="projects-page__modal-submit">
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </Modal>
  )
}
