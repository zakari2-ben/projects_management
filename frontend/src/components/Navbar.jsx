import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/components/Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__left">
          <Link to="/dashboard" className="navbar__brand">
            PM App
          </Link>
          <Link to="/projects" className="navbar__link">
            Projects
          </Link>
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
