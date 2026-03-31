import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { fetchAnalytics } from '../services/api'

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
  if (error) return <div className="analytics-error">Analytics unavailable: {error}</div>
  if (!data) return null

  const latest = data.latest_us_snapshot
  const trend = [...(data.monthly_us_trend || [])].reverse()
  const topPlants = data.top_plants_by_outage || []

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

      <div className="charts-row">
        {/* Monthly trend line */}
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

        {/* Top plants bar chart */}
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
    </div>
  )
}