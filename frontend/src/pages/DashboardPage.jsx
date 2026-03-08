import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import '../styles/pages/DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main">
        <h1 className="dashboard-page__title">Hello, {user?.name}</h1>
        <p className="dashboard-page__subtitle">Manage your projects and tasks from one place.</p>

        <div className="dashboard-page__grid">
          <Link to="/projects" className="dashboard-page__card">
            <h2 className="dashboard-page__card-title">Projects</h2>
            <p className="dashboard-page__card-text">Create, join, and manage project members.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
