import { useState } from 'react'
import FilterBar from './components/FilterBar'
import OutageTable from './components/OutageTable'
import RefreshButton from './components/RefreshButton'
import AnalyticsPanel from './components/AnalyticsPanel'
import { useOutages } from './hooks/useOutages'
import './index.css'

export default function App() {
  const [tab, setTab] = useState('data') // 'data' | 'analytics'
  const {
    rows, total, loading, error,
    filters, page, totalPages, pageSize,
    applyFilter, resetFilters,
    reload, nextPage, prevPage,
  } = useOutages()

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">⚛</span>
            <div>
              <h1 className="brand-title">Nuclear Outages</h1>
              <p className="brand-sub">U.S. Nuclear Generation — EIA Open Data</p>
            </div>
          </div>
          <div className="header-actions">
            <RefreshButton onComplete={reload} />
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="tab-nav">
        <button
          className={`tab-btn ${tab === 'data' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('data')}
        >
          Data Explorer
        </button>
        <button
          className={`tab-btn ${tab === 'analytics' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('analytics')}
        >
          Analytics
        </button>
      </nav>

      <main className="main">
        {tab === 'data' && (
          <>
            <FilterBar
              filters={filters}
              onFilter={applyFilter}
              onReset={resetFilters}
            />
            <OutageTable
              rows={rows}
              loading={loading}
              error={error}
              total={total}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onNext={nextPage}
              onPrev={prevPage}
            />
          </>
        )}

        {tab === 'analytics' && <AnalyticsPanel />}
      </main>
    </div>
  )
}