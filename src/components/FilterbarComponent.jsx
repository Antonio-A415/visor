const LEVELS = ['', 'facility', 'generator']
const US_STATES = [
  '', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export default function FilterBar({ filters, onFilter, onReset }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Level</label>
        <select
          className="filter-select"
          value={filters.level}
          onChange={e => onFilter('level', e.target.value)}
        >
          <option value="">All levels</option>
          {LEVELS.filter(Boolean).map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">State</label>
        <select
          className="filter-select"
          value={filters.state}
          onChange={e => onFilter('state', e.target.value)}
        >
          <option value="">All states</option>
          {US_STATES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Plant ID</label>
        <input
          className="filter-input"
          type="text"
          placeholder="e.g. STP"
          value={filters.plant_id}
          onChange={e => onFilter('plant_id', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">From</label>
        <input
          className="filter-input"
          type="date"
          value={filters.start_date}
          onChange={e => onFilter('start_date', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">To</label>
        <input
          className="filter-input"
          type="date"
          value={filters.end_date}
          onChange={e => onFilter('end_date', e.target.value)}
        />
      </div>

      <button className="btn btn-ghost" onClick={onReset}>
        Clear
      </button>
    </div>
  )
}