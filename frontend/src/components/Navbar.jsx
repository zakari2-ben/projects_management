import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import '../styles/components/Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
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
          <span className="navbar__user">{user?.name}</span>
          <button type="button" onClick={handleLogout} className="navbar__logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
