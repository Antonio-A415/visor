import { useState, useEffect, useCallback } from 'react'
import { fetchOutages } from '../services/api'

const DEFAULT_FILTERS = {
  level: '',
  state: '',
  plant_id: '',
  start_date: '',
  end_date: '',
}

const PAGE_SIZE = 50

/**
 * Central hook for outage data fetching, filtering, and pagination.
 * Returns data, loading/error state, filter controls, and pagination helpers.
 */
export function useOutages() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (currentFilters, currentPage) => {
    setLoading(true)
    setError(null)
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== '')
      )
      const result = await fetchOutages({
        ...activeFilters,
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE,
      })
      setRows(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload when filters or page changes
  useEffect(() => {
    load(filters, page)
  }, [filters, page, load])

  const applyFilter = useCallback((key, value) => {
    setPage(0) // Reset to first page on filter change
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setPage(0)
    setFilters(DEFAULT_FILTERS)
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    rows,
    total,
    loading,
    error,
    filters,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    applyFilter,
    resetFilters,
    reload: () => load(filters, page),
    nextPage: () => setPage(p => Math.min(p + 1, totalPages - 1)),
    prevPage: () => setPage(p => Math.max(p - 1, 0)),
  }
}