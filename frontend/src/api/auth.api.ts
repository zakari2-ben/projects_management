import { api, initializeCsrf } from './axios'
import type { User } from '../types'

type AuthResponse = { message: string; user: User }

export async function register(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
}) {
  await initializeCsrf()
  const { data } = await api.post<AuthResponse>('/register', payload)
  return data
}

export async function login(payload: { email: string; password: string }) {
  await initializeCsrf()
  const { data } = await api.post<AuthResponse>('/login', payload)
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>('/logout')
  return data
}

export async function me() {
  const { data } = await api.get<User>('/me')
  return data
}

export async function updateProfile(payload: { name: string; email: string }) {
  const { data } = await api.put<AuthResponse>('/profile', payload)
  return data
}

export async function updatePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}) {
  const { data } = await api.put<{ message: string }>('/profile/password', payload)
  return data
}
