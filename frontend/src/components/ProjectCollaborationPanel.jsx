import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const defaultPreferences = {
  inApp: true,
  email: true,
}

const maxAttachmentBytes = 2 * 1024 * 1024
const mentionRegex = /@([a-zA-Z0-9._-]+)/g

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const readFromStorage = (projectId) => {
  try {
    const raw = window.localStorage.getItem(`project-collab-${projectId}`)
    if (!raw) {
      return {
        commentsByTask: {},
        activityLog: [],
        notifications: [],
        preferencesByUser: {},
      }
    }

    const parsed = JSON.parse(raw)
    return {
      commentsByTask: parsed.commentsByTask || {},
      activityLog: parsed.activityLog || [],
      notifications: parsed.notifications || [],
      preferencesByUser: parsed.preferencesByUser || {},
    }
  } catch {
    return {
      commentsByTask: {},
      activityLog: [],
      notifications: [],
      preferencesByUser: {},
    }
  }
}

const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const memberTokens = (member) => {
  const name = String(member?.name || '')
  const email = String(member?.email || '')
  return [
    normalizeToken(name),
    normalizeToken(name.replace(/\s+/g, '_')),
    normalizeToken(name.replace(/\s+/g, '')),
    normalizeToken(email),
    normalizeToken(email.split('@')[0]),
  ].filter(Boolean)
}

const resolveMentions = (text, members) => {
  const tokens = [...new Set([...String(text || '').matchAll(mentionRegex)].map((match) => normalizeToken(match[1])))]
  return members.filter((member) => tokens.some((token) => memberTokens(member).includes(token)))
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed'))
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  })

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (value) =>
  new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function ProjectCollaborationPanel({
  projectId,
  tasks,
  members,
  currentUser,
  events,
  selectedTaskId,
  onSelectedTaskChange,
  onCommentsCountChange,
}) {
  const [commentsByTask, setCommentsByTask] = useState({})
  const [activityLog, setActivityLog] = useState([])
  const [notifications, setNotifications] = useState([])
  const [preferencesByUser, setPreferencesByUser] = useState({})
  const [commentText, setCommentText] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const processedEventsRef = useRef(new Set())

  const collaborators = useMemo(() => {
    const map = new Map()
    members.forEach((member) => map.set(String(member.id), member))
    map.set(String(currentUser.id), currentUser)
    return [...map.values()]
  }, [currentUser, members])

  const selectedTask = useMemo(
    () => tasks.find((task) => String(task.id) === String(selectedTaskId)) || null,
    [selectedTaskId, tasks],
  )

  const userNotifications = useMemo(
    () => notifications.filter((item) => String(item.recipientId) === String(currentUser.id)),
    [currentUser.id, notifications],
  )

  const unreadCount = useMemo(
    () => userNotifications.filter((item) => !item.readAt).length,
    [userNotifications],
  )

  useEffect(() => {
    const state = readFromStorage(projectId)
    setCommentsByTask(state.commentsByTask)
    setActivityLog(state.activityLog)
    setNotifications(state.notifications)
    setPreferencesByUser(state.preferencesByUser)
    processedEventsRef.current = new Set()
  }, [projectId])

  useEffect(() => {
    if (!preferencesByUser[String(currentUser.id)]) {
      setPreferencesByUser((prev) => ({
        ...prev,
        [String(currentUser.id)]: defaultPreferences,
      }))
    }
  }, [currentUser.id, preferencesByUser])

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      onSelectedTaskChange(String(tasks[0].id))
    }
  }, [onSelectedTaskChange, selectedTaskId, tasks])

  useEffect(() => {
    window.localStorage.setItem(
      `project-collab-${projectId}`,
      JSON.stringify({ commentsByTask, activityLog, notifications, preferencesByUser }),
    )
  }, [activityLog, commentsByTask, notifications, preferencesByUser, projectId])

  useEffect(() => {
    const counts = Object.fromEntries(
      Object.entries(commentsByTask).map(([taskId, comments]) => [taskId, Array.isArray(comments) ? comments.length : 0]),
    )
    onCommentsCountChange?.(counts)
  }, [commentsByTask, onCommentsCountChange])

  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) return
    const freshEvents = events.filter((item) => !processedEventsRef.current.has(item.id))
    if (freshEvents.length === 0) return

    freshEvents.forEach((item) => processedEventsRef.current.add(item.id))
    setActivityLog((prev) => [
      ...freshEvents.map((item) => ({
        id: createId(),
        createdAt: item.createdAt,
        message: item.message,
      })),
      ...prev,
    ])
    setNotifications((prev) => [
      ...freshEvents.flatMap((item) => item.notifications || []),
      ...prev,
    ])
  }, [events])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotifications((prev) =>
        prev.map((item) =>
          item.channel === 'email' && item.status === 'queued'
            ? { ...item, status: 'sent', sentAt: new Date().toISOString() }
            : item,
        ),
      )
    }, 3000)

    return () => window.clearInterval(interval)
  }, [])

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return
    setIsUploading(true)

    try {
      const next = []
      for (const file of files) {
        if (file.size > maxAttachmentBytes) {
          toast.error(`${file.name} > 2MB`)
          continue
        }
        const dataUrl = await fileToDataUrl(file)
        next.push({ id: createId(), name: file.name, size: file.size, dataUrl })
      }
      setPendingAttachments((prev) => [...prev, ...next].slice(0, 5))
    } finally {
      setIsUploading(false)
    }
  }

  const submitComment = (event) => {
    event.preventDefault()
    if (!selectedTask) {
      toast.error('Select task first')
      return
    }

    const text = commentText.trim()
    if (!text && pendingAttachments.length === 0) {
      toast.error('Add text or attachment')
      return
    }

    const mentions = resolveMentions(text, collaborators)
    const comment = {
      id: createId(),
      createdAt: new Date().toISOString(),
      author: { id: currentUser.id, name: currentUser.name },
      text,
      mentions,
      attachments: pendingAttachments,
    }
    const key = String(selectedTask.id)

    setCommentsByTask((prev) => ({
      ...prev,
      [key]: [comment, ...(prev[key] || [])],
    }))
    setCommentText('')
    setPendingAttachments([])

    setActivityLog((prev) => [
      {
        id: createId(),
        createdAt: comment.createdAt,
        message: `${currentUser.name} commented on "${selectedTask.name}"`,
      },
      ...prev,
    ])

    const recipients = [...new Set(mentions.map((member) => String(member.id)).filter((id) => id !== String(currentUser.id)))]
    if (selectedTask.assignee?.id && String(selectedTask.assignee.id) !== String(currentUser.id)) {
      recipients.push(String(selectedTask.assignee.id))
    }

    const generated = recipients.flatMap((recipientId) => {
      const pref = preferencesByUser[recipientId] || defaultPreferences
      const base = {
        recipientId,
        title: `New comment on ${selectedTask.name}`,
        message: text || 'Attachment shared',
        taskId: selectedTask.id,
        createdAt: comment.createdAt,
        readAt: null,
      }
      return [
        ...(pref.inApp ? [{ id: createId(), channel: 'in_app', ...base }] : []),
        ...(pref.email ? [{ id: createId(), channel: 'email', status: 'queued', sentAt: null, ...base }] : []),
      ]
    })

    if (generated.length > 0) {
      setNotifications((prev) => [...generated, ...prev])
    }
    toast.success('Comment added')
  }

  const currentPrefs = preferencesByUser[String(currentUser.id)] || defaultPreferences
  const selectedComments = commentsByTask[String(selectedTask?.id || '')] || []

  return (
    <section className="project-details-page__collab">
      <div className="project-details-page__collab-head">
        <h2 className="project-details-page__section-title">Collaboration d&apos;equipe</h2>
        <button type="button" className="project-details-page__notification-toggle" onClick={() => setIsOpen((prev) => !prev)}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </button>
      </div>

      <div className="project-details-page__collab-grid">
        <div className="project-details-page__collab-card">
          <p className="project-details-page__field-label">Mentions</p>
          <p className="project-details-page__collab-help">Use @username in comments.</p>
          <div className="project-details-page__member-list">
            {collaborators.map((member) => (
              <span key={member.id} className="project-details-page__member-chip">
                {member.name} <small>@{member.email?.split('@')[0]}</small>
              </span>
            ))}
          </div>
        </div>
        <div className="project-details-page__collab-card">
          <p className="project-details-page__field-label">Notification preferences</p>
          <label className="project-details-page__switch-row">
            <input
              type="checkbox"
              checked={currentPrefs.inApp}
              onChange={(event) =>
                setPreferencesByUser((prev) => ({
                  ...prev,
                  [String(currentUser.id)]: { ...currentPrefs, inApp: event.target.checked },
                }))
              }
            />
            <span>In-app</span>
          </label>
          <label className="project-details-page__switch-row">
            <input
              type="checkbox"
              checked={currentPrefs.email}
              onChange={(event) =>
                setPreferencesByUser((prev) => ({
                  ...prev,
                  [String(currentUser.id)]: { ...currentPrefs, email: event.target.checked },
                }))
              }
            />
            <span>Email</span>
          </label>
        </div>
      </div>

      {isOpen && (
        <div className="project-details-page__notification-list">
          {userNotifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`project-details-page__notification-item ${item.readAt ? 'project-details-page__notification-item--read' : ''}`}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((entry) => (entry.id === item.id ? { ...entry, readAt: entry.readAt || new Date().toISOString() } : entry)),
                )
              }
            >
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <small>{item.channel === 'email' ? `${item.status || 'queued'}` : 'in-app'} - {formatDate(item.createdAt)}</small>
            </button>
          ))}
        </div>
      )}

      <div className="project-details-page__discussion">
        <div className="project-details-page__discussion-head">
          <h2 className="project-details-page__section-title">Commentaires par tache</h2>
          <select
            value={selectedTaskId}
            onChange={(event) => onSelectedTaskChange(event.target.value)}
            className="project-details-page__input project-details-page__discussion-select"
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                #{task.id} {task.name}
              </option>
            ))}
          </select>
        </div>

        <form className="project-details-page__comment-form" onSubmit={submitComment}>
          <textarea
            rows={3}
            className="project-details-page__textarea"
            placeholder="Write a comment and mention teammates with @username"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
          />
          <div className="project-details-page__comment-actions">
            <label className="project-details-page__attachment-button">
              Attach files
              <input type="file" multiple className="project-details-page__file-input" onChange={handleAttachmentChange} />
            </label>
            <button type="submit" className="project-details-page__submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Post comment'}
            </button>
          </div>
          <div className="project-details-page__pending-attachments">
            {pendingAttachments.map((file) => (
              <div key={file.id} className="project-details-page__attachment-item">
                <span>{file.name} ({formatBytes(file.size)})</span>
                <button type="button" onClick={() => setPendingAttachments((prev) => prev.filter((item) => item.id !== file.id))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </form>

        <div className="project-details-page__comment-list">
          {selectedComments.map((comment) => (
            <article key={comment.id} className="project-details-page__comment-card">
              <header>
                <strong>{comment.author?.name || 'Unknown'}</strong>
                <small>{formatDate(comment.createdAt)}</small>
              </header>
              <p className="project-details-page__comment-text">{comment.text}</p>
              {comment.mentions?.length > 0 && (
                <small className="project-details-page__mention">
                  {comment.mentions.map((member) => `@${member.name}`).join(', ')}
                </small>
              )}
              <div className="project-details-page__comment-attachments">
                {comment.attachments?.map((attachment) => (
                  <a key={attachment.id} href={attachment.dataUrl} download={attachment.name} className="project-details-page__attachment-link">
                    {attachment.name}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="project-details-page__activity">
        <div className="project-details-page__discussion-head">
          <h2 className="project-details-page__section-title">Historique des activites</h2>
          <span className="project-details-page__activity-count">{activityLog.length} events</span>
        </div>
        <div className="project-details-page__activity-list">
          {activityLog.map((activity) => (
            <article key={activity.id} className="project-details-page__activity-item">
              <p>{activity.message}</p>
              <small>{formatDate(activity.createdAt)}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
