import { useEffect } from 'react'

const RightSidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-96',
  showOverlay = true 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div 
          className={`
            fixed inset-0 bg-black/20 backdrop-blur-sm z-40 
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={onClose}
          style={{
            transitionDelay: isOpen ? '0ms' : '100ms'
          }}
        />
      )}
      
      {/* Right Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full bg-white shadow-xl z-50 
        transform transition-all duration-400 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${width}
        overflow-y-auto
      `}
      style={{
        boxShadow: isOpen ? '-4px 0 24px rgba(0, 0, 0, 0.08)' : 'none',
        transitionDelay: isOpen ? '100ms' : '0ms'
      }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 transition-opacity duration-300">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-all duration-200 p-2 rounded-lg hover:bg-slate-100 hover:scale-105"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className={`
            transition-all duration-500 ease-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{
            transitionDelay: isOpen ? '200ms' : '0ms'
          }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default RightSidebar
