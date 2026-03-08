import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/http'
import '../styles/pages/RegisterPage.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await register(name, email, password, passwordConfirmation)
      toast.success('Account created')
      navigate('/dashboard')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not register'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-page__card">
        <h1 className="register-page__title">Register</h1>
        <form onSubmit={handleSubmit} className="register-page__form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="register-page__input"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="register-page__input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="register-page__input"
            required
          />
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Password confirmation"
            className="register-page__input"
            required
          />
          <button type="submit" disabled={submitting} className="register-page__submit">
            {submitting ? 'Loading...' : 'Create account'}
          </button>
        </form>
        <p className="register-page__hint">
          Already have an account?{' '}
          <Link to="/login" className="register-page__link">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
