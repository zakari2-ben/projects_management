import Modal from '../Modal'

export default function JoinProjectModal({
  open,
  onClose,
  onSubmit,
  inviteCode,
  setInviteCode,
  submitting,
}) {
  return (
    <Modal open={open} title="Join project" onClose={onClose}>
      <form onSubmit={onSubmit} className="projects-page__modal-form">
        <input
          type="text"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
          placeholder="Invite code"
          className="projects-page__input projects-page__input--uppercase"
          required
        />
        <button type="submit" disabled={submitting} className="projects-page__modal-submit">
          {submitting ? 'Joining...' : 'Join'}
        </button>
      </form>
    </Modal>
  )
}
