import '../styles/components/KpiCard.css'

export default function KpiCard({ label, value, tone = 'neutral' }) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <p className="kpi-card__label">{label}</p>
      <p className="kpi-card__value">{value}</p>
    </article>
  )
}
