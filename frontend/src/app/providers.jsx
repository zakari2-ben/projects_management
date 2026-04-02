import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { ProjectProvider } from '../context/ProjectContext'
import { NotificationProvider } from '../context/NotificationContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <NotificationProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                border: '1px solid #cbd5e1',
                color: '#0f172a',
              },
            }}
          />
        </NotificationProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
