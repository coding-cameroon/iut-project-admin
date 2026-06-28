import { useState, useEffect, useCallback } from 'react'

export const useMockReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportType, setReportType] = useState('alerts')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filter, setFilter] = useState('all')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock reports data
      const mockReports = [
        {
          id: 1,
          title: 'Rapport d\'alertes quotidiennes',
          type: 'alerts',
          date: '2024-04-15',
          status: 'completed',
          size: '2.4 MB',
          records: 156,
          downloadUrl: '#'
        },
        {
          id: 2,
          title: 'Analyse des utilisateurs',
          type: 'users',
          date: '2024-04-14',
          status: 'completed',
          size: '1.8 MB',
          records: 45,
          downloadUrl: '#'
        },
        {
          id: 3,
          title: 'Performance système',
          type: 'performance',
          date: '2024-04-13',
          status: 'completed',
          size: '3.2 MB',
          records: 89,
          downloadUrl: '#'
        },
        {
          id: 4,
          title: 'Tendances mensuelles',
          type: 'trends',
          date: '2024-04-12',
          status: 'completed',
          size: '4.1 MB',
          records: 234,
          downloadUrl: '#'
        },
        {
          id: 5,
          title: 'Rapport de synthèse',
          type: 'summary',
          date: '2024-04-11',
          status: 'completed',
          size: '1.5 MB',
          records: 67,
          downloadUrl: '#'
        },
        {
          id: 6,
          title: 'Analyse des alertes',
          type: 'alerts',
          date: '2024-04-10',
          status: 'completed',
          size: '2.8 MB',
          records: 178,
          downloadUrl: '#'
        },
        {
          id: 7,
          title: 'Rapport utilisateurs',
          type: 'users',
          date: '2024-04-09',
          status: 'completed',
          size: '2.1 MB',
          records: 52,
          downloadUrl: '#'
        },
        {
          id: 8,
          title: 'Performance hebdomadaire',
          type: 'performance',
          date: '2024-04-08',
          status: 'completed',
          size: '3.5 MB',
          records: 112,
          downloadUrl: '#'
        }
      ]
      
      // Apply filters
      let filteredReports = mockReports
      
      if (reportType) {
        filteredReports = filteredReports.filter(report => report.type === reportType)
      }
      
      if (filter !== 'all') {
        filteredReports = filteredReports.filter(report => report.status === filter)
      }
      
      if (dateRange.start || dateRange.end) {
        filteredReports = filteredReports.filter(report => {
          const reportDate = new Date(report.date)
          const startDate = dateRange.start ? new Date(dateRange.start) : null
          const endDate = dateRange.end ? new Date(dateRange.end) : null
          
          if (startDate && reportDate < startDate) return false
          if (endDate && reportDate > endDate) return false
          return true
        })
      }
      
      setReports(filteredReports)
    } catch (err) {
      setError(err.message || 'Failed to fetch reports')
      console.error('Reports fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange, filter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const exportReport = async (format) => {
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Exporting report in ${format} format`)
      // In real app, this would trigger file download
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return {
    reports,
    loading,
    error,
    reportType,
    setReportType,
    dateRange,
    setDateRange,
    filter,
    setFilter,
    exportReport
  }
}
