import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getApiErrorDetails } from '../utils/http'
import '../styles/pages/RegisterPage.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters'
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }
    if (password !== passwordConfirmation) {
      nextErrors.password_confirmation = 'Passwords do not match'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation)
      toast.success('Account created')
      navigate('/dashboard')
    } catch (error) {
      const details = getApiErrorDetails(error, 'Could not register')
      setFieldErrors(details.fieldErrors)
      toast.error(details.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-page__card">
        <h1 className="register-page__title">Create account</h1>
        <p className="register-page__subtitle">Set up your workspace and start organizing tasks.</p>

        <form onSubmit={handleSubmit} className="register-page__form">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="register-page__input"
              required
              autoComplete="name"
            />
            {fieldErrors.name && <p className="register-page__error">{fieldErrors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="register-page__input"
              required
              autoComplete="email"
            />
            {fieldErrors.email && <p className="register-page__error">{fieldErrors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="register-page__input"
              required
              autoComplete="new-password"
            />
            {fieldErrors.password && <p className="register-page__error">{fieldErrors.password}</p>}
          </div>

          <div>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Password confirmation"
              className="register-page__input"
              required
              autoComplete="new-password"
            />
            {fieldErrors.password_confirmation && (
              <p className="register-page__error">{fieldErrors.password_confirmation}</p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="register-page__submit">
            {submitting ? 'Loading...' : 'Create account'}
          </button>
        </form>

        <div className="register-page__hint">
          <Link to="/forgot-password" className="register-page__link">
            Forgot your password?
          </Link>
          <div>
            Already have an account?{' '}
            <Link to="/login" className="register-page__link">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
