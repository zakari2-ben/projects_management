import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth.api'
import toast from 'react-hot-toast'
import '../styles/pages/AuthPages.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await forgotPassword(email)
            toast.success(response.message || 'Password reset link sent to your email.')
            setEmail('')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link.')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <h2 className="auth-title">Forgot your password?</h2>
        <p className="auth-subtitle">Enter your email and we&apos;ll send you a link to reset your password.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="auth-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
