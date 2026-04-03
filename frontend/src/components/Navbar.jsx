import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NavbarNotifications from './NavbarNotifications'
import '../styles/components/Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast.error('Could not log out. Please try again.')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__left">
          <NavLink to="/dashboard" className="navbar__brand">
            PM App
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Projects
          </NavLink>
        </div>
        <div className="navbar__right">
          <NavbarNotifications />
          <button
            type="button"
            onClick={toggleTheme}
            className={`navbar__theme-toggle ${isDark ? 'is-dark' : ''}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="navbar__theme-icon navbar__theme-icon--sun" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M12 5a1 1 0 0 1 1 1v1.2a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1Zm0 10.8a1 1 0 0 1 1 1V18a1 1 0 0 1-2 0v-1.2a1 1 0 0 1 1-1Zm7-3.8a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-1.2a1 1 0 0 1 0-2H19Zm-10.8 0a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2h1.2Zm7.02-5.62a1 1 0 0 1 1.41 0l.84.84a1 1 0 0 1-1.41 1.42l-.84-.85a1 1 0 0 1 0-1.41Zm-8.46 8.47a1 1 0 0 1 1.41 0l.85.84a1 1 0 1 1-1.42 1.41l-.84-.84a1 1 0 0 1 0-1.41Zm9.3 1.68a1 1 0 0 1 0-1.41l.84-.84a1 1 0 1 1 1.42 1.41l-.85.84a1 1 0 0 1-1.41 0Zm-8.47-8.47a1 1 0 0 1 0-1.41l.84-.84a1 1 0 1 1 1.41 1.41l-.84.84a1 1 0 0 1-1.41 0ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
              </svg>
            </span>
            <span className="navbar__theme-icon navbar__theme-icon--moon" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M20 13.2a1 1 0 0 0-1.32-.95 6.8 6.8 0 0 1-8.93-8.93A1 1 0 0 0 8.8 2a10 10 0 1 0 11.2 11.2Z" />
              </svg>
            </span>
          </button>
          <NavLink to="/profile" className="navbar__profile-link">
            <div className="navbar__avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="navbar__avatar-image" />
              ) : (
                <div className="navbar__avatar-fallback">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="navbar__user">{user?.name}</span>
          </NavLink>
          <button type="button" onClick={handleLogout} className="navbar__logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
