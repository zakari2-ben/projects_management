import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resendVerification, verifyEmail } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
    const { user, refreshUser } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [verifying, setVerifying] = useState(false)
    const [resending, setResending] = useState(false)

    // URL params from email link
    const verificationUrl = searchParams.get('url')

    // Auto-verify if the link is present
    useEffect(() => {
        if (verificationUrl && !verifying) {
            const performVerification = async () => {
                setVerifying(true)
                try {
                    // In a real scenario you might need to extract the path from the URL
                    // But assuming 'url' query param is the full `/api/email/verify/ID/HASH?expires=...`
                    // We will fetch it directly.
                    const urlObj = new URL(verificationUrl)
                    const endpoint = urlObj.pathname + urlObj.search

                    // Split out ID and HASH
                    const parts = urlObj.pathname.split('/')
                    const hash = parts.pop()
                    const id = parts.pop()

                    await verifyEmail(id, hash, urlObj.search)
                    toast.success("Email verified successfully!")
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

    // Redirect if already verified
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors duration-200">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-xl dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/50 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-6">
                    <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Verify your email
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Thanks for signing up! Before getting started, you need to verify your email address.
                    Check the inbox for <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span>.
                </p>

                <button
                    onClick={handleResend}
                    disabled={resending || verifying}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 dark:focus:ring-offset-gray-900 transition-all active:scale-[0.98] mb-4"
                >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                    onClick={() => {
                        // Need to logout if they decide to use a different account
                        navigate('/dashboard') // Or some other action
                    }}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    Skip for now (you will be restricted)
                </button>
            </div>
        </div>
    )
}
