import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
const runtimeBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`
const baseURL = configuredBaseUrl
  ? configuredBaseUrl
      .replace('http://localhost:8000', runtimeBaseUrl)
      .replace('http://127.0.0.1:8000', runtimeBaseUrl)
  : runtimeBaseUrl

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

export async function initializeCsrf(): Promise<void> {
  await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}
