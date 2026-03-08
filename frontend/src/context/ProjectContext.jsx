import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as projectApi from '../api/projects.api'

const ProjectContext = createContext(undefined)

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
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

  const createProject = useCallback(async (name, description) => {
    const project = await projectApi.createProject({ name, description })
    setProjects((prev) => [project, ...prev])
  }, [])

  const joinProject = useCallback(async (inviteCode) => {
    const project = await projectApi.joinProject(inviteCode)
    setProjects((prev) => {
      const exists = prev.some((item) => item.id === project.id)
      return exists ? prev : [project, ...prev]
    })
  }, [])

  const value = useMemo(
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
