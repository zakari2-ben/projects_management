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
              ☀️
            </span>
            <span className="navbar__theme-icon navbar__theme-icon--moon" aria-hidden>
              🌙
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
