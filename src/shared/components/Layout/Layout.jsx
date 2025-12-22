/**
 * Layout Component
 *
 * Simplified layout with 2 nav items + settings.
 * - Jobs: Main view with list/kanban toggle
 * - Profile: Resume + Contacts
 */
import { useState } from 'react'
import './Layout.css'

function Layout({
  children,
  currentView,
  onNavigate,
  resumeExists,
  applicationCount,
  viewMode = 'list',
  onViewModeChange
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // For mobile

  // Navigation items
  const navItems = [
    { id: 'jobs', label: 'Jobs', icon: 'jobs', badge: applicationCount },
    { id: 'profile', label: 'Resume', icon: 'resume', status: resumeExists ? 'done' : 'pending' },
    { id: 'contacts', label: 'Contacts', icon: 'contacts' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ]

  const handleNavigate = (view) => {
    onNavigate(view)
    setSidebarOpen(false)
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Navbar - Full Width */}
      <header className="top-navbar">
        <div className="top-navbar-inner">
          <div className="top-navbar-left">
            <button
              className="navbar-btn menu-toggle-mobile"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span className="menu-icon" />
            </button>
            <a href="#" className="top-navbar-logo" onClick={() => handleNavigate('jobs')}>
              <img src="/gaptrack/logo.png" alt="GapTrack" className="navbar-logo-img" />
              <span className="navbar-logo-text">GapTrack</span>
            </a>
          </div>

          <div className="top-navbar-center">
            {/* View Mode Toggle - only show on Jobs view */}
            {currentView === 'jobs' && onViewModeChange && (
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => onViewModeChange('list')}
                  title="List view"
                >
                  <span className="view-icon view-icon-list" />
                  <span className="view-label">List</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => onViewModeChange('kanban')}
                  title="Kanban view"
                >
                  <span className="view-icon view-icon-kanban" />
                  <span className="view-label">Kanban</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'funnel' ? 'active' : ''}`}
                  onClick={() => onViewModeChange('funnel')}
                  title="Funnel view"
                >
                  <span className="view-icon view-icon-funnel" />
                  <span className="view-label">Funnel</span>
                </button>
              </div>
            )}
          </div>

          <div className="top-navbar-right">
            {/* Spacer to balance the layout */}
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={`collapse-icon ${sidebarCollapsed ? 'collapsed' : ''}`} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`nav-icon nav-icon-${item.icon}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="nav-status-dot" />
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p className="footer-text">
            Built with privacy in mind.{' '}
            <a
              href="https://github.com/chaiovercode/gaptrack"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Layout
