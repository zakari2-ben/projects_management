import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as projectApi from '../api/projects.api'
import type { Project } from '../types'

type ProjectContextValue = {
  projects: Project[]
  loading: boolean
  fetchProjects: () => Promise<void>
  createProject: (name: string, description?: string) => Promise<void>
  joinProject: (inviteCode: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const list = await projectApi.getProjects()
      setProjects(list)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = useCallback(async (name: string, description?: string) => {
    const project = await projectApi.createProject({ name, description })
    setProjects((prev) => [project, ...prev])
  }, [])

  const joinProject = useCallback(async (inviteCode: string) => {
    const project = await projectApi.joinProject(inviteCode)
    setProjects((prev) => {
      const exists = prev.some((item) => item.id === project.id)
      return exists ? prev : [project, ...prev]
    })
  }, [])

  const value = useMemo<ProjectContextValue>(
    () => ({ projects, loading, fetchProjects, createProject, joinProject }),
    [projects, loading, fetchProjects, createProject, joinProject],
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used inside ProjectProvider')
  }
  return context
}
