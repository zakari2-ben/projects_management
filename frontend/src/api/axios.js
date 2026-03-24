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
  // Bearer tokens don't need withCredentials for cross-origin cookies
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

// Add Bearer token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and fire a custom event so AuthContext can log the user out
      localStorage.removeItem('auth_token')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)
