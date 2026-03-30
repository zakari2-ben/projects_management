import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import PageLoader from '../components/PageLoader'
import { useAuth } from '../context/AuthContext'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ProjectDetailsPage = lazy(() => import('../pages/ProjectDetailsPage'))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const TaskDetailsPage = lazy(() => import('../pages/TaskDetailsPage'))

// New Auth & Profile Pages
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))

function withPageLoader(page) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>
}

// Ensure the user is authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Ensure the user is NOT authenticated (for login, register, forgot/reset password)
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // Public / Guest Routes
  { path: '/login', element: <GuestRoute>{withPageLoader(<LoginPage />)}</GuestRoute> },
  { path: '/register', element: <GuestRoute>{withPageLoader(<RegisterPage />)}</GuestRoute> },
  { path: '/forgot-password', element: <GuestRoute>{withPageLoader(<ForgotPasswordPage />)}</GuestRoute> },
  { path: '/reset-password', element: <GuestRoute>{withPageLoader(<ResetPasswordPage />)}</GuestRoute> },

  // Protected Routes (verification skipped)
  { path: '/verify-email', element: <ProtectedRoute>{withPageLoader(<VerifyEmailPage />)}</ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute>{withPageLoader(<ProfilePage />)}</ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute>{withPageLoader(<DashboardPage />)}</ProtectedRoute> },
  { path: '/projects', element: <ProtectedRoute>{withPageLoader(<ProjectsPage />)}</ProtectedRoute> },
  { path: '/projects/:projectId', element: <ProtectedRoute>{withPageLoader(<ProjectDetailsPage />)}</ProtectedRoute> },
  { path: '/projects/:projectId/tasks/:taskId', element: <ProtectedRoute>{withPageLoader(<TaskDetailsPage />)}</ProtectedRoute> },
])
