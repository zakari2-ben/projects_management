import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as projectApi from '../api/projects.api'

const ProjectContext = createContext(undefined)

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upsertProject = useCallback((project) => {
    setProjects((prev) => {
      const index = prev.findIndex((item) => item.id === project.id)
      if (index === -1) return [project, ...prev]

      const next = [...prev]
      next[index] = project
      return next
    })
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await projectApi.getProjects()
      setProjects(list)
      return list
    } catch (fetchError) {
      setError('Could not load projects.')
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = useCallback(async (name, description) => {
    const project = await projectApi.createProject({ name, description })
    upsertProject(project)
    return project
  }, [upsertProject])

  const joinProject = useCallback(async (inviteCode) => {
    const project = await projectApi.joinProject(inviteCode)
    upsertProject(project)
    return project
  }, [upsertProject])

  const value = useMemo(
    () => ({ projects, loading, error, fetchProjects, createProject, joinProject }),
    [projects, loading, error, fetchProjects, createProject, joinProject],
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
