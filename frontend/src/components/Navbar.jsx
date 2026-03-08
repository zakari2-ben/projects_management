import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-semibold text-slate-900">
            PM App
          </Link>
          <Link to="/projects" className="text-sm text-slate-600">
            Projects
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
