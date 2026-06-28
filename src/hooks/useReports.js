import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

export const useReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    dateRange: { start: '', end: '' },
    filter: 'all'
  })

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        ...filters,
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end })
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      const response = await apiService.getReports(params)
      setReports(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch reports')
      console.error('Reports fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const generateReport = useCallback(async (config) => {
    try {
      const newReport = await apiService.generateReport(config)
      setReports(prev => [newReport, ...prev])
      return newReport
    } catch (err) {
      setError(err.message || 'Failed to generate report')
      throw err
    }
  }, [])

  const exportReport = useCallback(async (id, format = 'pdf') => {
    try {
      const exportData = await apiService.exportReport(id, format)
      
      // Create download link
      const blob = new Blob([exportData], { type: getContentType(format) })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${id}.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
      return exportData
    } catch (err) {
      setError(err.message || 'Failed to export report')
      throw err
    }
  }, [])

  const getContentType = (format) => {
    switch (format) {
      case 'pdf': return 'application/pdf'
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv': return 'text/csv'
      case 'json': return 'application/json'
      default: return 'application/octet-stream'
    }
  }

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getReportStats = useCallback(() => {
    const stats = {
      total: reports.length,
      alerts: reports.filter(r => r.type === 'alerts').length,
      users: reports.filter(r => r.type === 'users').length,
      performance: reports.filter(r => r.type === 'performance').length,
      trends: reports.filter(r => r.type === 'trends').length,
      summary: reports.filter(r => r.type === 'summary').length,
      completed: reports.filter(r => r.status === 'completed').length,
      pending: reports.filter(r => r.status === 'pending').length,
      failed: reports.filter(r => r.status === 'failed').length
    }
    return stats
  }, [reports])

  const filteredReports = reports.filter(report => {
    const matchesType = !filters.type || report.type === filters.type
    const matchesFilter = filters.filter === 'all' || 
      (filters.filter === 'high' && report.records > 100) ||
      (filters.filter === 'pending' && report.status === 'pending') ||
      (filters.filter === 'resolved' && report.status === 'completed')
    return matchesType && matchesFilter
  })

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports: filteredReports,
    allReports: reports,
    loading,
    error,
    filters,
    generateReport,
    exportReport,
    updateFilters,
    clearError,
    getReportStats,
    refreshReports: fetchReports
  }
}
