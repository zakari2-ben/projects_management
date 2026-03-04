import { api } from './axios'
import type { Task, TaskStatus } from '../types'

type Collection<T> = { data: T[] }

export async function getTasks(projectId: number) {
  const { data } = await api.get<Collection<Task>>(`/projects/${projectId}/tasks`)
  return data.data
}

export async function getTask(projectId: number, taskId: number) {
  const { data } = await api.get<Task>(`/projects/${projectId}/tasks/${taskId}`)
  return data
}

export async function createTask(
  projectId: number,
  payload: {
    name: string
    description?: string
    status?: TaskStatus
    due_date?: string
    assigned_user_id?: number | null
  },
) {
  const { data } = await api.post<{ message: string; task: Task }>(`/projects/${projectId}/tasks`, payload)
  return data.task
}

export async function updateTask(
  projectId: number,
  taskId: number,
  payload: {
    name?: string
    description?: string
    status?: TaskStatus
    due_date?: string
    assigned_user_id?: number | null
  },
) {
  const { data } = await api.put<{ message: string; task: Task }>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload,
  )
  return data.task
}

export async function updateTaskStatus(projectId: number, taskId: number, status: TaskStatus) {
  const { data } = await api.patch<{ message: string; task: Task }>(
    `/projects/${projectId}/tasks/${taskId}/status`,
    { status },
  )
  return data.task
}

export async function assignTask(projectId: number, taskId: number, assignedUserId: number | null) {
  const { data } = await api.patch<{ message: string; task: Task }>(
    `/projects/${projectId}/tasks/${taskId}/assign`,
    { assigned_user_id: assignedUserId },
  )
  return data.task
}

export async function deleteTask(projectId: number, taskId: number) {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`)
}
