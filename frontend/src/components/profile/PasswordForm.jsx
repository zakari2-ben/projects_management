export default function PasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit,
}) {
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">Change Password</h2>
      <form onSubmit={onSubmit} className="profile-form profile-form--password">
        <div>
          <label className="profile-field__label">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="profile-field__input"
          />
        </div>
        <div>
          <label className="profile-field__label">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="profile-field__input"
          />
        </div>
        <div>
          <label className="profile-field__label">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="profile-field__input"
          />
        </div>
        <button type="submit" disabled={loading} className="profile-submit">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}
