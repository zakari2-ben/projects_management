export default function ProfileInfoForm({ name, setName, email, setEmail, loading, onSubmit }) {
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">Profile Information</h2>
      <form onSubmit={onSubmit} className="profile-form">
        <div>
          <label className="profile-field__label">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="profile-field__input"
          />
        </div>
        <div>
          <label className="profile-field__label">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="profile-field__input"
          />
        </div>
        <button type="submit" disabled={loading} className="profile-submit">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </section>
  )
}
