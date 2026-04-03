import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ProjectProvider } from '../context/ProjectContext'
import { NotificationProvider } from '../context/NotificationContext'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <NotificationProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-strong)',
                  boxShadow: 'var(--shadow-soft)',
                },
              }}
            />
          </NotificationProvider>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
