import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { ProjectProvider } from '../context/ProjectContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProjectProvider>
        {children}
        <Toaster position="top-right" />
      </ProjectProvider>
    </AuthProvider>
  )
}
