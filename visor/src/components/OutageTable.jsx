import { useState } from 'react'
import StatusBadge from './StatusBadge'

const COLUMNS = [
  { key: 'report_date', label: 'Date' },
  { key: 'plant_name', label: 'Plant' },
  { key: 'state', label: 'State' },
  { key: 'level', label: 'Level' },
  { key: 'unit_name', label: 'Unit' },
  { key: 'capacity_mw', label: 'Capacity (MW)' },
  { key: 'outage_mw', label: 'Outage (MW)' },
  { key: 'percent_outage', label: '% Outage' },
]

function sortRows(rows, key, dir) {
  return [...rows].sort((a, b) => {
    const av = a[key] ?? ''
    const bv = b[key] ?? ''
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })
}

function fmt(val, key) {
  if (val === null || val === undefined) return '—'
  if (key === 'capacity_mw' || key === 'outage_mw') return Number(val).toLocaleString('en-US', { maximumFractionDigits: 1 })
  return val
}

export default function OutageTable({ rows, loading, error, total, page, totalPages, onNext, onPrev, pageSize }) {
  const [sortKey, setSortKey] = useState('report_date')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = sortRows(rows, sortKey, sortDir)
  const offset = page * pageSize

  if (error) {
    return (
      <div className="empty-state empty-state--error">
        <span className="empty-icon">⚠</span>
        <p className="empty-title">Failed to load data</p>
        <p className="empty-sub">{error}</p>
      </div>
    )
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">○</span>
        <p className="empty-title">No outage records found</p>
        <p className="empty-sub">Try adjusting your filters or trigger a data refresh.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      {loading && <div className="table-loading"><span className="spinner" /> Loading…</div>}
      <table className="outage-table">
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={sortKey === col.key ? 'sorted' : ''}
              >
                {col.label}
                <span className="sort-arrow">
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr key={row.snapshot_id}>
              {COLUMNS.map(col => (
                <td key={col.key}>
                  {col.key === 'percent_outage'
                    ? <StatusBadge value={row[col.key]} />
                    : fmt(row[col.key], col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span className="pagination-info">
          {offset + 1}–{Math.min(offset + pageSize, total)} of {total.toLocaleString()} records
        </span>
        <div className="pagination-controls">
          <button className="btn btn-sm" onClick={onPrev} disabled={page === 0}>← Prev</button>
          <span className="page-indicator">Page {page + 1} / {totalPages || 1}</span>
          <button className="btn btn-sm" onClick={onNext} disabled={page >= totalPages - 1}>Next →</button>
        </div>
      </div>
    </div>
  )
}