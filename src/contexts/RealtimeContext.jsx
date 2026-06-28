import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import apiService from '../services/api'

const RealtimeContext = createContext()

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

export const RealtimeProvider = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const [liveStats, setLiveStats] = useState(null)
  const [liveAlerts, setLiveAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const wsUrl = `ws://localhost:3000?token=${token}`
      
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeEvent(data)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setConnected(false)
        
        // Attempt reconnection if not explicitly closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting reconnection (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error')
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Disconnected by user')
      wsRef.current = null
    }
    
    setConnected(false)
    reconnectAttempts.current = 0
  }, [])

  const handleRealtimeEvent = useCallback((data) => {
    switch (data.type) {
      case 'stats_update':
        setLiveStats(data.payload)
        break
      case 'alert_created':
        setLiveAlerts(prev => [data.payload, ...prev.slice(0, 9)]) // Keep last 10
        setNotifications(prev => [{
          id: Date.now(),
          type: 'alert',
          message: `New alert: ${data.payload.title}`,
          timestamp: new Date(),
          data: data.payload
        }, ...prev.slice(0, 4)]) // Keep last 5
        break
      case 'alert_updated':
        setLiveAlerts(prev => prev.map(alert => 
          alert.id === data.payload.id ? data.payload : alert
        ))
        break
      case 'user_connected':
      case 'user_disconnected':
        // Handle user connection events
        break
      case 'system_notification':
        setNotifications(prev => [{
          id: Date.now(),
          type: 'system',
          message: data.payload.message,
          timestamp: new Date(),
          data: data.payload
        }, ...prev.slice(0, 4)])
        break
      default:
        console.log('Unknown realtime event:', data)
    }
  }, [])

  const sendEvent = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket not connected')
    }
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Fetch initial live data
  const fetchLiveData = useCallback(async () => {
    try {
      const [stats, alerts] = await Promise.all([
        apiService.getLiveStats(),
        apiService.getLiveAlerts()
      ])
      
      setLiveStats(stats)
      setLiveAlerts(alerts.data || [])
    } catch (err) {
      console.error('Failed to fetch live data:', err)
    }
  }, [])

  useEffect(() => {
    connect()
    fetchLiveData()

    return () => {
      disconnect()
    }
  }, [connect, disconnect, fetchLiveData])

  const value = {
    connected,
    liveStats,
    liveAlerts,
    notifications,
    error,
    connect,
    disconnect,
    sendEvent,
    clearNotifications,
    fetchLiveData
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}
