import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as notificationsApi from '../api/notifications.api'

const NotificationContext = createContext(undefined)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const list = await notificationsApi.getNotifications()
      setNotifications(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchNotifications()
    const interval = setInterval(() => void fetchNotifications(), 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications])

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, read_at: item.read_at || new Date().toISOString() } : item)))
    try {
      await notificationsApi.markAsRead(notificationId)
    } catch {
      // On failure, refetch to stay consistent
      void fetchNotifications()
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    try {
      await notificationsApi.markAllAsRead()
    } catch {
      void fetchNotifications()
    }
  }, [fetchNotifications])

  const value = useMemo(
    () => ({
      notifications,
      loading,
      unreadCount,
      refresh: fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [fetchNotifications, loading, markAllAsRead, markAsRead, notifications, unreadCount],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider')
  }
  return context
}
