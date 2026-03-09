import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getApiErrorDetails } from '../utils/http'
import '../styles/pages/LoginPage.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    try {
      await login(email.trim(), password)
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch (error) {
      const details = getApiErrorDetails(error, 'Invalid credentials')
      setFieldErrors(details.fieldErrors)
      toast.error(details.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">Login</h1>
        <p className="login-page__subtitle">Sign in to manage your projects and team tasks.</p>
        <form onSubmit={handleSubmit} className="login-page__form">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-page__input"
              required
              autoComplete="email"
            />
            {fieldErrors.email && <p className="login-page__error">{fieldErrors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-page__input"
              required
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="login-page__error">{fieldErrors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="login-page__submit">
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
