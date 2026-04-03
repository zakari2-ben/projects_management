export default function AvatarSection({ user, avatarLoading, onUpload }) {
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">Profile Picture</h2>
      <div className="profile-avatar">
        <div className="profile-avatar__media">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="profile-avatar__image" />
          ) : (
            <svg className="profile-avatar__fallback" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        <div>
          <label className="profile-upload">
            {avatarLoading ? 'Uploading...' : 'Change Avatar'}
            <input type="file" accept="image/*" onChange={onUpload} disabled={avatarLoading} />
          </label>
          <p className="profile-upload__note">JPG, GIF or PNG. 1MB max.</p>
        </div>
      </div>
    </section>
  )
}
