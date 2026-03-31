import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    ...(import.meta.env.VITE_APP_API_KEY
      ? { 'X-API-Key': import.meta.env.VITE_APP_API_KEY }
      : {}),
  },
})

/**
 * Fetch paginated outage records with optional filters.
 * @param {Object} params - { level, plant_id, state, start_date, end_date, limit, offset }
 */
export async function fetchOutages(params = {}) {
  const { data } = await api.get('/data', { params })
  return data // { total, limit, offset, data: [...] }
}

/**
 * Fetch pre-computed analytics (top plants, monthly trend, latest US snapshot).
 */
export async function fetchAnalytics() {
  const { data } = await api.get('/data/analytics')
  return data
}

/**
 * Trigger a synchronous refresh (no real-time progress).
 * @param {boolean} incremental - Only fetch new dates since last run.
 */
export async function triggerRefresh(incremental = true) {
  const { data } = await api.post('/refresh', null, { params: { incremental } })
  return data
}

/**
 * Fetch refresh run history.
 */
export async function fetchRefreshLog(limit = 10) {
  const { data } = await api.get('/refresh/log', { params: { limit } })
  return data
}

/**
 * Fetch API health status.
 */
export async function fetchHealth() {
  const { data } = await api.get('/health')
  return data
}

/**
 * Open a WebSocket connection to /refresh/ws and stream progress events.
 * @param {boolean} incremental
 * @param {Function} onProgress - called with each progress event object
 * @param {Function} onDone - called when extraction completes
 * @param {Function} onError - called on error
 * @returns {WebSocket} - so caller can close() if needed
 */
export function openRefreshSocket({ incremental = true, onProgress, onDone, onError }) {
  const wsBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/^http/, 'ws')
  const ws = new WebSocket(`${wsBase}/refresh/ws`)

  ws.onopen = () => {
    ws.send(JSON.stringify({ incremental }))
  }

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data)
      if (msg.event === 'done') onDone?.(msg)
      else if (msg.event === 'error') onError?.(msg)
      else onProgress?.(msg)
    } catch {
      // ignore malformed messages
    }
  }

  ws.onerror = () => onError?.({ message: 'WebSocket connection failed' })

  return ws
}