import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { fetchAnalytics } from '../services/api'

// ── Estadísticas descriptivas ──────────────────────────────────────────────
function mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function mode(arr) {
  if (!arr.length) return 0
  const freq = {}
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
  const max = Math.max(...Object.values(freq))
  const modes = Object.keys(freq).filter(k => freq[k] === max).map(Number)
  return modes.length === arr.length ? null : modes[0] // null = no hay moda
}

function variance(arr) {
  if (!arr.length) return 0
  const m = mean(arr)
  return mean(arr.map(v => (v - m) ** 2))
}

function stddev(arr) {
  return Math.sqrt(variance(arr))
}

function computeStats(arr) {
  if (!arr.length) return null
  const m = mean(arr)
  const mo = mode(arr)
  return {
    mean: m,
    median: median(arr),
    mode: mo,
    variance: variance(arr),
    stddev: stddev(arr),
    min: Math.min(...arr),
    max: Math.max(...arr),
  }
}

function fmt(v, decimals = 2) {
  if (v === null || v === undefined) return '—'
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: decimals })
}

// ── Componente de tabla de stats ───────────────────────────────────────────
function StatsTable({ title, stats }) {
  if (!stats) return null
  const rows = [
    { label: 'Media',              value: fmt(stats.mean) },
    { label: 'Mediana',            value: fmt(stats.median) },
    { label: 'Moda',               value: stats.mode !== null ? fmt(stats.mode) : 'Sin moda' },
    { label: 'Varianza',           value: fmt(stats.variance) },
    { label: 'Desv. estándar',     value: fmt(stats.stddev) },
    { label: 'Mín',                value: fmt(stats.min) },
    { label: 'Máx',                value: fmt(stats.max) },
  ]
  return (
    <div className="stats-card">
      <h3 className="chart-title">{title}</h3>
      <table className="stats-table">
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <td className="stats-label">{r.label}</td>
              <td className="stats-value">{r.value} MW</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────
export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="analytics-loading"><span className="spinner" /> Loading analytics…</div>
  if (error)   return <div className="analytics-error">Analytics unavailable: {error}</div>
  if (!data)   return null

  const latest   = data.latest_us_snapshot
  const trend    = [...(data.monthly_us_trend || [])].reverse()
  const topPlants = data.top_plants_by_outage || []

  // Extraer valores numéricos para las stats
  const trendValues    = trend.map(d => d.avg_outage_mw).filter(Boolean)
  const plantsValues   = topPlants.map(d => d.avg_outage_mw).filter(Boolean)

  const trendStats  = computeStats(trendValues)
  const plantsStats = computeStats(plantsValues)

  return (
    <div className="analytics-panel">

      {/* KPI strip */}
      {latest && (
        <div className="kpi-strip">
          <div className="kpi">
            <span className="kpi-label">Total Capacity</span>
            <span className="kpi-value">{Number(latest.total_capacity_mw).toLocaleString()} MW</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Current Outage</span>
            <span className="kpi-value kpi-value--warn">{Number(latest.total_outage_mw).toLocaleString()} MW</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Outage Rate</span>
            <span className="kpi-value kpi-value--pct">{Number(latest.percent_outage).toFixed(2)}%</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">As of</span>
            <span className="kpi-value kpi-value--date">{latest.report_date}</span>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">US Outage Trend (MW)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(0, 7)} />
              <YAxis tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={v => [`${Number(v).toLocaleString()} MW`, 'Avg Outage']}
                labelFormatter={l => `Month: ${l?.slice(0, 7)}`}
              />
              <Line type="monotone" dataKey="avg_outage_mw" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Plants by Avg Outage (MW)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topPlants} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="plant_name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={v => [`${Number(v).toLocaleString()} MW`, 'Avg Outage']} />
              <Bar dataKey="avg_outage_mw" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estadísticas descriptivas */}
      <div className="charts-row">
        <StatsTable title="Estadísticas — Tendencia Mensual"  stats={trendStats} />
        <StatsTable title="Estadísticas — Top Plants"         stats={plantsStats} />
      </div>

    </div>
  )
}