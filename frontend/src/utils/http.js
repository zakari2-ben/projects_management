import axios from 'axios'

function toFieldErrors(errors) {
  if (!errors || typeof errors !== 'object') return {}

  return Object.entries(errors).reduce((acc, [field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      acc[field] = String(messages[0])
    }
    return acc
  }, {})
}

export function getApiErrorDetails(error, fallback = 'Something went wrong') {
  if (!axios.isAxiosError(error)) {
    return {
      message: fallback,
      fieldErrors: {},
      statusCode: null,
    }
  }

  const statusCode = error.response?.status ?? null
  const data = error.response?.data
  const fieldErrors = toFieldErrors(data?.errors)
  const firstFieldMessage = Object.values(fieldErrors)[0]

  return {
    message: firstFieldMessage || data?.message || fallback,
    fieldErrors,
    statusCode,
  }
}

export function getApiErrorMessage(error, fallback) {
  return getApiErrorDetails(error, fallback).message
}
