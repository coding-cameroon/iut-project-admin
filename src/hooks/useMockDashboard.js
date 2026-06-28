import { useState, useEffect, useCallback } from 'react'

export const useMockDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('24h')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock dashboard data
      const mockStats = {
        summary: {
          totalAlerts: 24,
          pendingAlerts: 8,
          inProgressAlerts: 5,
          resolvedAlerts: 11,
          cancelledAlerts: 0,
          totalUsers: 156,
          activeUsers: 23,
          resolutionRate: 45.8
        },
        breakdown: {
          byType: [
            { type: 'INTRUSION', count: 12 },
            { type: 'SYSTEM', count: 6 },
            { type: 'MAINTENANCE', count: 4 },
            { type: 'NETWORK', count: 2 }
          ],
          byPriority: [
            { priority: 'HIGH', count: 6 },
            { priority: 'MEDIUM', count: 10 },
            { priority: 'LOW', count: 8 }
          ],
          byStatus: [
            { status: 'PENDING', count: 8 },
            { status: 'IN_PROGRESS', count: 5 },
            { status: 'RESOLVED', count: 11 }
          ]
        }
      }
      
      const mockRecentAlerts = [
        {
          id: 1,
          title: 'Intrusion détectée - Zone A',
          priority: 'HIGH',
          status: 'PENDING',
          location: 'Tour Eiffel',
          time: 'Il y a 5 min',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Panne système - Serveur B',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          location: 'La Défense',
          time: 'Il y a 15 min',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Maintenance caméra - Entrée Sud',
          priority: 'LOW',
          status: 'RESOLVED',
          location: 'Bastille',
          time: 'Il y a 1h',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          title: 'Alerte température - Entrepôt',
          priority: 'HIGH',
          status: 'RESOLVED',
          location: 'Port de Marseille',
          time: 'Il y a 2h',
          createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
        }
      ]
      
      setStats(mockStats)
      setRecentAlerts(mockRecentAlerts)
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const refreshData = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    stats,
    recentAlerts,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshData
  }
}
