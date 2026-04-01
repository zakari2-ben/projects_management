import { api } from './axios'

async function getNotifications(limit = 50) {
  const { data } = await api.get('/notifications', { params: { limit } })
  return data.data
}

async function markAsRead(id) {
  await api.patch(`/notifications/${id}/read`)
}

async function markAllAsRead() {
  await api.patch('/notifications/read-all')
}

export { getNotifications, markAsRead, markAllAsRead }
