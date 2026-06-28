import { useState, useEffect, useCallback } from 'react'

export const useMockAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Mock alerts data
      const mockAlerts = [
        {
          id: 1,
          title: 'Intrusion détectée - Tour Eiffel',
          description: 'Mouvement suspect détecté par les caméras de surveillance',
          priority: 'HIGH',
          status: 'PENDING',
          location: 'Tour Eiffel - Paris 7ème',
          assignedTo: 'Agent Dubois',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Panne système - Serveur B',
          description: 'Le serveur principal ne répond plus aux requêtes',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          location: 'La Défense - Paris',
          assignedTo: 'Technicien Martin',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Maintenance caméra - Entrée Sud',
          description: 'Caméra de surveillance hors service pour maintenance',
          priority: 'LOW',
          status: 'RESOLVED',
          location: 'Bastille - Paris 4ème',
          assignedTo: 'Agent Bernard',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          title: 'Alerte température - Entrepôt',
          description: 'Température anormale détectée dans l\'entrepôt frigorifique',
          priority: 'HIGH',
          status: 'RESOLVED',
          location: 'Port de Marseille',
          assignedTo: 'Agent Petit',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 5,
          title: 'Accès non autorisé - Zone C',
          description: 'Tentative d\'accès avec carte non autorisée',
          priority: 'MEDIUM',
          status: 'PENDING',
          location: 'Montmartre - Paris 18ème',
          assignedTo: 'Agent Rousseau',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 6,
          title: 'Perte de connexion - Antenne relais',
          description: 'La connexion réseau a été interrompue',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          location: 'Lyon - Partie Dieu',
          assignedTo: 'Technicien Leroy',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 7,
          title: 'Anomalie de température - Datacenter',
          description: 'Surchauffe détectée dans le datacenter principal',
          priority: 'MEDIUM',
          status: 'PENDING',
          location: 'Lille - Zone Industrielle',
          assignedTo: 'Agent Morel',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 8,
          title: 'Batterie faible - Capteur A',
          description: 'Le capteur de mouvement signale une batterie faible',
          priority: 'LOW',
          status: 'RESOLVED',
          location: 'Nice - Promenade des Anglais',
          assignedTo: 'Agent Laurent',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // Apply filters
      let filteredAlerts = mockAlerts
      
      if (filters.search) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          alert.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          alert.location.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      if (filters.status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filters.status)
      }
      
      if (filters.priority) {
        filteredAlerts = filteredAlerts.filter(alert => alert.priority === filters.priority)
      }
      
      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit
      const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + pagination.limit)
      
      setAlerts(paginatedAlerts)
      setPagination(prev => ({
        ...prev,
        total: filteredAlerts.length
      }))
    } catch (err) {
      setError(err.message || 'Failed to fetch alerts')
      console.error('Alerts fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const updateStatus = async (id, newStatus) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, status: newStatus } : alert
      ))
    } catch (err) {
      console.error('Failed to update alert status:', err)
    }
  }

  const deleteAlert = async (id) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setAlerts(prev => prev.filter(alert => alert.id !== id))
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }))
    } catch (err) {
      console.error('Failed to delete alert:', err)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const refreshAlerts = () => {
    fetchAlerts()
  }

  return {
    alerts,
    loading,
    error,
    filters,
    pagination,
    updateStatus,
    deleteAlert,
    handleFilterChange,
    handlePageChange,
    refreshAlerts
  }
}
