import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { ProjectProvider } from '../context/ProjectContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ProjectProvider>
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
      </ProjectProvider>
    </AuthProvider>
  )
}
