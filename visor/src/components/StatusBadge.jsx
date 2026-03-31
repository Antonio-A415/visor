export default function StatusBadge({ value }) {
  if (value === null || value === undefined) return <span className="badge badge-neutral">—</span>

  const pct = parseFloat(value)
  let cls = 'badge-success'
  if (pct >= 50) cls = 'badge-danger'
  else if (pct >= 20) cls = 'badge-warning'
  else if (pct > 0) cls = 'badge-info'

  return (
    <span className={`badge ${cls}`}>
      {pct.toFixed(1)}%
    </span>
  )
}