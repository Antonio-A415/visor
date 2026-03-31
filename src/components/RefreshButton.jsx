import { useState, useRef } from 'react'
import { openRefreshSocket } from '../services/api'

export default function RefreshButton({ onComplete }) {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [messages, setMessages] = useState([])
  const [count, setCount] = useState(0)
  const wsRef = useRef(null)

  function addMsg(msg) {
    setMessages(prev => [...prev.slice(-5), msg]) // keep last 6 messages
  }

  function handleRefresh() {
    if (status === 'running') {
      wsRef.current?.close()
      setStatus('idle')
      return
    }

    setStatus('running')
    setMessages([])
    setCount(0)

    wsRef.current = openRefreshSocket({
      incremental: true,
      onProgress: (evt) => {
        addMsg(evt.message)
        if (evt.count) setCount(evt.count)
      },
      onDone: (evt) => {
        addMsg(evt.message)
        setStatus('done')
        setCount(evt.count || 0)
        onComplete?.()
        setTimeout(() => setStatus('idle'), 4000)
      },
      onError: (evt) => {
        addMsg(evt.message || 'Unknown error')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      },
    })
  }

  const label = {
    idle: '↻  Refresh Data',
    running: '◼  Stop',
    done: '✓  Done',
    error: '⚠  Error',
  }[status]

  const btnClass = `btn btn-refresh btn-refresh--${status}`

  return (
    <div className="refresh-wrapper">
      <button className={btnClass} onClick={handleRefresh}>
        {status === 'running' && <span className="spinner spinner--sm" />}
        {label}
      </button>

      {messages.length > 0 && (
        <div className="refresh-log">
          {messages.map((m, i) => (
            <div key={i} className={`refresh-log-line ${i === messages.length - 1 ? 'refresh-log-line--active' : ''}`}>
              {m}
            </div>
          ))}
          {status === 'running' && (
            <div className="refresh-log-count">{count.toLocaleString()} rows processed</div>
          )}
        </div>
      )}
    </div>
  )
}