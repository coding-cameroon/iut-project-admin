import { useState, useEffect, useCallback, useRef } from 'react'

const useRealtime = () => {
  const [liveStats, setLiveStats] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Mock realtime data for now - replace with actual WebSocket when backend is ready
  const fetchLiveData = useCallback(async () => {
    try {
      // Simulate API call to get live data
      const response = await fetch('http://localhost:3001/api/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch live data')
      const data = await response.json()
      setLiveStats(data)
      setConnected(true)
      return data
    } catch (err) {
      console.warn('Live data fetch failed, using mock data:', err)
      setError(err.message)
      setConnected(false)
      return null
    }
  }, [])

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    try {
      // For now, use polling instead of WebSocket
      const interval = setInterval(() => {
        fetchLiveData()
      }, 30000) // Poll every 30 seconds

      // Initial fetch
      fetchLiveData()

      return () => {
        clearInterval(interval)
      }
    } catch (err) {
      console.error('Realtime connection error:', err)
      setError(err.message)
      setConnected(false)
    }
  }, [fetchLiveData])

  useEffect(() => {
    const cleanup = connect()
    
    return () => {
      if (cleanup) cleanup()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return {
    liveStats,
    connected,
    error,
    fetchLiveData
  }
}

export { useRealtime }
export default useRealtime
