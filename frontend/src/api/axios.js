import axios from 'axios'

function getRuntimeBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8000'
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`
}

function resolveBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  const runtimeBaseUrl = getRuntimeBaseUrl()

  if (!configuredBaseUrl) return runtimeBaseUrl

  return configuredBaseUrl
    .replace('http://localhost:8000', runtimeBaseUrl)
    .replace('http://127.0.0.1:8000', runtimeBaseUrl)
}

const baseURL = resolveBaseUrl()

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

export async function initializeCsrf() {
  await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}
