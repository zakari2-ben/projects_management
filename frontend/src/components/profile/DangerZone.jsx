export default function DangerZone({
  showDeleteModal,
  setShowDeleteModal,
  deletePassword,
  setDeletePassword,
  deleteLoading,
  onDelete,
}) {
  return (
    <section className="profile-danger">
      <h2 className="profile-danger__title">Danger Zone</h2>
      <p className="profile-danger__text">Once you delete your account, there is no going back. Please be certain.</p>
      <button onClick={() => setShowDeleteModal(true)} className="profile-danger__trigger">
        Delete Account
      </button>

      {showDeleteModal && (
        <div className="profile-danger-modal" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <div className="profile-danger-modal__backdrop" aria-hidden="true" onClick={() => setShowDeleteModal(false)} />

          <div className="profile-danger-modal__panel">
            <form onSubmit={onDelete}>
              <div className="profile-danger-modal__head">
                <div className="profile-danger-modal__icon" aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="profile-danger-modal__title" id="delete-account-title">
                    Delete Account
                  </h3>
                  <p className="profile-danger-modal__description">
                    Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="profile-danger-modal__field">
                <label className="profile-field__label">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="profile-field__input"
                  placeholder="Enter password to confirm"
                />
              </div>

              <div className="profile-danger-modal__actions">
                <button type="submit" disabled={deleteLoading} className="profile-danger__confirm">
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="profile-danger__cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
