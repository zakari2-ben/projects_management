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
          <NavLink to="/profile" className="flex items-center space-x-2 mr-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-indigo-100 overflow-hidden border border-indigo-200">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-indigo-700 font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="navbar__user font-medium">{user?.name}</span>
          </NavLink>
          <button type="button" onClick={handleLogout} className="navbar__logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
