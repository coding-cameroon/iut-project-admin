import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Alertes', href: '/alerts', icon: 'notifications' },
    { name: 'Carte', href: '/map', icon: 'map' },
    { name: 'Utilisateurs', href: '/users', icon: 'people' },
    { name: 'Rapports', href: '/reports', icon: 'assessment' },
    { name: 'Paramètres', href: '/settings', icon: 'settings' }
  ]

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
      
      if (width < 640) {
        setSidebarOpen(false)
      } else if (width >= 1024) {
        setSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const getDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }

    if (user?.name) {
      return user.name
    }

    if (user?.email) {
      return user.email.split('@')[0]
    }

    return 'Administrator'
  }

  const getInitials = () => {
    const name = getDisplayName()
    const parts = name.split(' ').filter(Boolean)

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }

    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
  }

  const getRoleLabel = () => {
    if (!user?.role) {
      return 'Administrator'
    }

    return user.role.replace(/_/g, ' ')
  }

  // Modern icon components (similar to Heroicons)
  const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
      dashboard: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      notifications: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      map: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      people: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      assessment: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      settings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
    return icons[name] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans antialiased">
      {/* Mobile Overlay - modern blur effect */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Modern glassmorphic design */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'fixed w-72' : (sidebarOpen ? 'w-64' : 'w-20')}
        bg-white/90 backdrop-blur-xl border-r border-slate-200/80 shadow-xl shadow-slate-200/30
        transition-all duration-300 ease-out flex flex-col
        h-screen z-50 lg:relative lg:translate-x-0
      `}>
        {/* Logo Area - Minimal & Elegant */}
        <div className="flex items-center h-16 px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 text-sm tracking-tight">Sécurité</span>
                <span className="text-[11px] text-slate-400 -mt-0.5">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Clean & Spacious */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={closeSidebar}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive(item.href) 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                    ${isActive(item.href) 
                      ? 'text-indigo-600' 
                      : 'text-slate-500 group-hover:text-indigo-500'
                    }
                  `}>
                    <Icon name={item.icon} className="w-5 h-5" />
                  </div>
                  {(sidebarOpen || isMobile) && (
                    <span className={`
                      text-sm font-medium transition-all duration-200
                      ${isActive(item.href) ? 'text-indigo-700' : 'text-slate-700'}
                    `}>
                      {item.name}
                    </span>
                  )}
                  {isActive(item.href) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section - Sleek Profile Card */}
        <div className="p-3 border-t border-slate-100 mt-auto">
          <div className={`
            flex items-center gap-3 rounded-xl p-2 transition-all duration-200
            ${sidebarOpen || isMobile ? 'justify-start' : 'justify-center'}
          `}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{getInitials()}</span>
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{getDisplayName()}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email || 'admin@iut.local'}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Clean, transparent, modern */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-slate-500 hover:text-indigo-600 p-2 -ml-2 rounded-xl transition-all duration-200 hover:bg-slate-50"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications - Minimal with subtle indicator */}
              <button className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              
              {/* User Avatar - Clean & Elegant */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-slate-800">{getDisplayName()}</div>
                  <div className="text-xs text-slate-500">{getRoleLabel()}</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
                  <span className="text-slate-600 text-sm font-medium">{getInitials()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Smooth scrolling, elegant spacing */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout