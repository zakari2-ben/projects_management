import { api } from './axios'
import type { Project, User } from '../types'

type Collection<T> = { data: T[] }

export async function getProjects() {
  const { data } = await api.get<Collection<Project>>('/projects')
  return data.data
}

export async function getProject(projectId: number) {
  const { data } = await api.get<Project>(`/projects/${projectId}`)
  return data
}

export async function createProject(payload: { name: string; description?: string }) {
  const { data } = await api.post<{ message: string; project: Project }>('/projects', payload)
  return data.project
}

export async function updateProject(projectId: number, payload: { name?: string; description?: string }) {
  const { data } = await api.put<{ message: string; project: Project }>(`/projects/${projectId}`, payload)
  return data.project
}

export async function deleteProject(projectId: number) {
  await api.delete(`/projects/${projectId}`)
}

export async function joinProject(inviteCode: string) {
  const { data } = await api.post<{ message: string; project: Project }>('/projects/join', {
    invite_code: inviteCode,
  })
  return data.project
}

export async function getProjectMembers(projectId: number) {
  const { data } = await api.get<Collection<User>>(`/projects/${projectId}/users`)
  return data.data
}
