import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/http'
import '../styles/pages/LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid credentials'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">Login</h1>
        <form onSubmit={handleSubmit} className="login-page__form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="login-page__input"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="login-page__input"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="login-page__submit"
        >
          {submitting ? 'Loading...' : 'Login'}
        </button>
        </form>
        <p className="login-page__hint">
          No account?{' '}
          <Link to="/register" className="login-page__link">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
