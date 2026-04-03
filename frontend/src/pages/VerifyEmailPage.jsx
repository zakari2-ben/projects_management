import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resendVerification, verifyEmail } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import '../styles/pages/AuthPages.css'

export default function VerifyEmailPage() {
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const verificationUrl = searchParams.get('url')

  useEffect(() => {
    if (verificationUrl && !verifying) {
      const performVerification = async () => {
        setVerifying(true)
        try {
          const urlObj = new URL(verificationUrl)
          const parts = urlObj.pathname.split('/')
          const hash = parts.pop()
          const id = parts.pop()

          await verifyEmail(id, hash, urlObj.search)
          toast.success('Email verified successfully!')
          await refreshUser()
          navigate('/dashboard')
        } catch (err) {
          toast.error(err.response?.data?.message || 'Verification failed or link expired.')
        } finally {
          setVerifying(false)
        }
      }
      performVerification()
    }
  }, [verificationUrl, navigate, refreshUser, verifying])

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleResend = async () => {
    setResending(true)
    try {
      const response = await resendVerification(user?.email)
      toast.success(response.message || 'Verification link sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send link.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--compact">
        <div className="auth-icon" aria-hidden="true">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h2 className="auth-title">Verify your email</h2>
        <p className="auth-subtitle">
          Thanks for signing up. Check the inbox for <span className="auth-email">{user?.email}</span> and confirm your account.
        </p>

        <div className="auth-form">
          <button onClick={handleResend} disabled={resending || verifying} className="auth-button">
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button
            onClick={() => {
              navigate('/dashboard')
            }}
            className="auth-button auth-button--ghost"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
