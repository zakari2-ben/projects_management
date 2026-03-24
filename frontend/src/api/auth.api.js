import { api } from './axios'

export async function register(payload) {
  const { data } = await api.post('/register', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/login', payload)
  return data
}

export async function logout() {
  const { data } = await api.post('/logout')
  return data
}

export async function me() {
  const { data } = await api.get('/me')
  return data // Returns { data: userObject } due to Resource wrapper, or { user } depending on how we structured it.
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data
}

export async function updatePassword(payload) {
  const { data } = await api.put('/profile/password', payload)
  return data
}

export async function forgotPassword(email) {
  const { data } = await api.post('/forgot-password', { email })
  return data
}

export async function resetPassword(payload) {
  const { data } = await api.post('/reset-password', payload)
  return data
}

export async function verifyEmail(id, hash, signatureUrl) {
  // Extract query params from signatureUrl if necessary, or just hit the exact API endpoint.
  // The API expects: GET /email/verify/{id}/{hash}?expires=...&signature=...
  // Usually, we just pass the full URL or query string provided by Laravel.
  const { data } = await api.get(`/email/verify/${id}/${hash}${signatureUrl}`)
  return data
}

export async function resendVerification(email) {
  const { data } = await api.post('/email/verification-notification', { email })
  return data
}

export async function confirmPassword(password) {
  const { data } = await api.post('/confirm-password', { password })
  return data
}

export async function uploadAvatar(formData) {
  // Ensure multipart/form-data header is set for the file upload
  const { data } = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function deleteAccount(password) {
  const { data } = await api.delete('/profile', {
    data: { password } // axios.delete requires sending body payload inside `data`
  })
  return data
}
