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
  onViewModeChange,
  isDemo = false,
  onLogoClick,
  onExitDemo
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
    window.location.hash = view
    onNavigate(view)
    setSidebarOpen(false)
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isDemo ? 'demo-mode' : ''}`}>
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
            <a
              href="/gaptrack/"
              className="top-navbar-logo"
              onClick={(e) => {
                e.preventDefault();
                if (onLogoClick) {
                  onLogoClick();
                }
              }}
              title="Go to homepage"
            >
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

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner-text">
            Demo Mode - Viewing sample data for Janardan Jakhar
          </span>
          <button className="demo-banner-btn" onClick={onExitDemo}>
            Exit Demo
          </button>
        </div>
      )}

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
                {item.icon === 'settings' ? (
                  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                ) : (
                  <span className={`nav-icon nav-icon-${item.icon}`} />
                )}
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
