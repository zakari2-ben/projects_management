import '../styles/components/PageLoader.css'

export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
