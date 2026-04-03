import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth.api'
import toast from 'react-hot-toast'
import '../styles/pages/AuthPages.css'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== passwordConfirmation) {
      return toast.error("Passwords do not match!")
    }

    setLoading(true)
    try {
      const response = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      toast.success(response.message || 'Password has been safely reset.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page auth-page--danger">
        <div className="auth-card auth-card--compact">
          <h2 className="auth-title auth-title--danger">Invalid Link</h2>
          <p className="auth-subtitle auth-subtitle--danger">This password reset link is invalid or has expired.</p>
          <div className="auth-footer">
            <button onClick={() => navigate('/forgot-password')} className="auth-button auth-button--ghost">
              Request a new link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          Choose a new secure password for <span className="auth-email">{email}</span>
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__stack">
            <div>
              <label htmlFor="password" className="auth-label">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Enter a strong password"
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="auth-label">
                Confirm New Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="auth-input"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
