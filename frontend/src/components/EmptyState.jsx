import '../styles/components/EmptyState.css'

export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
    </div>
  )
}
