import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}</h1>
        <p className="mt-2 text-slate-600">Manage your projects and tasks from one place.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link to="/projects" className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
            <p className="mt-2 text-sm text-slate-600">Create, join, and manage project members.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
