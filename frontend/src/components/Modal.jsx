import { useEffect } from 'react'
import '../styles/components/Modal.css'

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal__content"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button type="button" onClick={onClose} className="modal__close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
