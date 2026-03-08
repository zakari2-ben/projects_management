import '../styles/components/Modal.css'

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="modal">
      <div className="modal__content">
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
