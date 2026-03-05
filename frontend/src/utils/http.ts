import axios from 'axios'

type ValidationErrorResponse = {
  message?: string
  errors?: Record<string, string[]>
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const response = error.response?.data as ValidationErrorResponse | undefined
  if (!response) {
    return fallback
  }

  const firstFieldErrors = response.errors ? Object.values(response.errors)[0] : undefined
  const firstFieldMessage = firstFieldErrors?.[0]

  return firstFieldMessage || response.message || fallback
}
