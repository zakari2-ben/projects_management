import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/http'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        >
          {submitting ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account?{' '}
        <Link to="/register" className="text-blue-600">
          Register
        </Link>
      </p>
    </div>
  )
}
