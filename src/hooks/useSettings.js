import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

export const useSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Sécurité Temps Réel',
      siteDescription: 'Plateforme de gestion et de signalement d\'incidents de sécurité',
      contactEmail: 'contact@securite.com',
      timezone: 'Europe/Paris',
      language: 'fr',
      itemsPerPage: 10,
      autoRefresh: true,
      refreshInterval: 30
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertTypes: {
        high: true,
        medium: true,
        low: false
      },
      recipients: []
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      twoFactorAuth: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    system: {
      logLevel: 'info',
      backupEnabled: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      maintenanceMode: false,
      apiRateLimit: 1000,
      maxFileSize: 10
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const fetchedSettings = await apiService.getSettings()
      setSettings(fetchedSettings)
    } catch (err) {
      setError(err.message || 'Failed to fetch settings')
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (category, newSettings) => {
    setSaving(true)
    setError(null)
    setSuccess('')
    
    try {
      const updatedSettings = await apiService.updateSettings({
        [category]: newSettings
      })
      
      setSettings(prev => ({
        ...prev,
        [category]: updatedSettings[category] || newSettings
      }))
      
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
      
      return updatedSettings
    } catch (err) {
      setError(err.message || 'Failed to update settings')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const updateGeneralSettings = useCallback((newSettings) => {
    return updateSettings('general', newSettings)
  }, [updateSettings])

  const updateNotificationSettings = useCallback((newSettings) => {
    return updateSettings('notifications', newSettings)
  }, [updateSettings])

  const updateSecuritySettings = useCallback((newSettings) => {
    return updateSettings('security', newSettings)
  }, [updateSettings])

  const updateSystemSettings = useCallback((newSettings) => {
    return updateSettings('system', newSettings)
  }, [updateSettings])

  const exportSettings = useCallback(() => {
    const settingsJson = JSON.stringify(settings, null, 2)
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [settings])

  const importSettings = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          setSettings(importedSettings)
          setSuccess('Settings imported successfully')
          setTimeout(() => setSuccess(''), 3000)
          resolve(importedSettings)
        } catch (err) {
          setError('Failed to import settings')
          reject(err)
        }
      }
      reader.onerror = () => {
        setError('Failed to read file')
        reject(new Error('Failed to read file'))
      }
      reader.readAsText(file)
    })
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess('')
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    saving,
    error,
    success,
    updateSettings,
    updateGeneralSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    updateSystemSettings,
    exportSettings,
    importSettings,
    clearMessages,
    refreshSettings: fetchSettings
  }
}
