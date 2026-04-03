import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { formatRelativeTime } from '../utils/time'
import '../styles/components/Notifications.css'

const TYPE_ICON = {
  done: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 16.5 5 12l1.4-1.4 3.1 3.1 8.1-8.1L19 7l-9.5 9.5Z" />
    </svg>
  ),
  overdue: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-9V6h-2v7h6v-2h-4Z" />
    </svg>
  ),
  member: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.5 11v-2a4.5 4.5 0 0 0-9 0v2h-2v-2a6.5 6.5 0 0 1 13 0v2h-2ZM17 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 8a5.5 5.5 0 0 1 4.9 3h-2.3a3.5 3.5 0 0 0-3.6-2.5H12V13h5Z" />
    </svg>
  ),
  deadline: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Zm-6 2h2v4h-2v-4Zm0 6h2v2h-2v-2Z" />
    </svg>
  ),
  task_created: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h14v2H5v14H3V6a2 2 0 0 1 2-2Zm4 4h10v12H9V8Zm2 2v2h2v-2h-2Zm0 4v2h4v-2h-4Z" />
    </svg>
  ),
  task_updated: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h16v2H4v14h10v2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm13.7 3.3 2 2L13 16h-2v-2l6.7-6.7Zm1.4-1.4a1 1 0 0 1 0 1.4l-1 1-2-2 1-1a1 1 0 0 1 1.4 0l0.6 0.6Z" />
    </svg>
  ),
  task_deleted: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 6h10l-1 14H8L7 6Zm3-3h4l1 2H9l1-2Z" />
    </svg>
  ),
  task_moved: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 6 8h4v8H6l6 6 6-6h-4V8h4L12 2Z" />
    </svg>
  ),
  profile_updated: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm-7 9a7 7 0 0 1 14 0v1H5v-1Z" />
    </svg>
  ),
}

export default function NavbarNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const buttonRef = useRef(null)

  const visibleNotifications = useMemo(() => notifications.slice(0, 12), [notifications])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMarkOne = (id) => {
    markAsRead(id)
  }

  return (
    <div className="navbar-notifications">
      <button
        ref={buttonRef}
        type="button"
        className="navbar-notifications__button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="navbar-notifications__bell">
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm7-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C8.64 5.36 7 7.92 7 11v5L5 18v1h14v-1l-2-2Z" />
        </svg>
        {unreadCount > 0 ? (
          <span key={unreadCount} className="navbar-notifications__badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div ref={panelRef} className="navbar-notifications__panel">
          <div className="navbar-notifications__header">
            <div>
              <p className="navbar-notifications__title">Notifications</p>
              <p className="navbar-notifications__subtitle">
                {unreadCount === 0 ? 'You are all caught up' : `${unreadCount} unread`}
              </p>
            </div>
            <button
              type="button"
              className="navbar-notifications__mark-all"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          <div className="navbar-notifications__list" role="list">
            {visibleNotifications.length === 0 ? (
              <p className="navbar-notifications__empty">No notifications yet.</p>
            ) : (
              visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`navbar-notifications__item ${notification.read_at ? 'is-read' : 'is-unread'}`}
                  onClick={() => handleMarkOne(notification.id)}
                  role="listitem"
                >
                  <span className={`navbar-notifications__icon navbar-notifications__icon--${notification.type}`}>
                    {TYPE_ICON[notification.type] || TYPE_ICON.deadline}
                  </span>
                  <span className="navbar-notifications__content">
                    <span className="navbar-notifications__message">{notification.message}</span>
                    <span className="navbar-notifications__meta">
                      {notification.project_name ? <span className="navbar-notifications__pill">{notification.project_name}</span> : null}
                      <span className="navbar-notifications__time">{formatRelativeTime(notification.created_at)}</span>
                    </span>
                  </span>
                  {!notification.read_at ? <span className="navbar-notifications__dot" aria-hidden="true" /> : null}
                </button>
              ))
            )}
          </div>

          <div className="navbar-notifications__footer">
            <a
              href="#"
              className="navbar-notifications__view-all"
              onClick={(event) => event.preventDefault()}
            >
              View all notifications
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
