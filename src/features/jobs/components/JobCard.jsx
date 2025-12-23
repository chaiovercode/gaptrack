/**
 * JobCard Component
 *
 * Compact card for job applications. Click to edit.
 */
import { useState, useRef, useEffect } from 'react'
import './JobCard.css'

const STATUSES = [
  { value: 'applied', label: 'Applied', color: '#6366f1' },
  { value: 'screening', label: 'Screening', color: '#8b5cf6' },
  { value: 'interview', label: 'Interviewing', color: '#f59e0b' },
  { value: 'offer', label: 'Offer Received', color: '#10b981' },
  { value: 'accepted', label: 'Accepted', color: '#059669' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#6b7280' }
]

function JobCard({
  job,
  contacts = [],
  onStatusChange,
  onDelete,
  onEdit
}) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const { company, role, location, status, gapAnalysis, linkedContacts = [] } = job

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const jobContacts = linkedContacts
    .map(id => contacts.find(c => c.id === id))
    .filter(Boolean)

  const matchScore = gapAnalysis?.matchScore || null
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#A9070E'
  }

  const currentStatus = STATUSES.find(s => s.value === status) || STATUSES[0]

  const handleStatusChange = (newStatus) => {
    onStatusChange(job.id, newStatus)
    setShowStatusDropdown(false)
  }

  return (
    <div className={`job-card ${showStatusDropdown ? 'dropdown-open' : ''}`}>
      {/* Card Header */}
      <div className="job-card-header" onClick={() => onEdit(job)}>
        {/* Left: Company Logo Placeholder + Info */}
        <div className="job-card-left">
          <div className="company-avatar">
            {company.charAt(0).toUpperCase()}
          </div>
          <div className="job-info">
            <h3 className="job-title">{role}</h3>
            <div className="job-meta">
              <span className="job-company">{company}</span>
              {location && (
                <>
                  <span className="meta-dot">•</span>
                  <span className="job-location">{location}</span>
                </>
              )}
            </div>
            {jobContacts.length > 0 && (
              <div className="job-contacts">
                {jobContacts.slice(0, 2).map(contact => (
                  <span key={contact.id} className="contact-badge">
                    {contact.name}
                  </span>
                ))}
                {jobContacts.length > 2 && (
                  <span className="contact-badge more">+{jobContacts.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Score */}
        <div className="match-score-cell">
          {matchScore !== null ? (
            <span
              className="match-score-text"
              style={{ '--score-color': getScoreColor(matchScore) }}
            >
              {matchScore}%
            </span>
          ) : (
            <span className="match-score-empty">--</span>
          )}
        </div>

        {/* Right: Status + Actions */}
        <div className="job-card-right">
          <div className="status-wrapper" ref={dropdownRef}>
            <button
              className="status-button"
              style={{ '--status-color': currentStatus.color }}
              onClick={(e) => {
                e.stopPropagation()
                setShowStatusDropdown(!showStatusDropdown)
              }}
            >
              <span className="status-dot"></span>
              {currentStatus.label}
              <svg className="status-chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>

            {showStatusDropdown && (
              <div className="status-dropdown">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    className={`status-option ${s.value === status ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange(s.value)
                    }}
                  >
                    <span className="option-dot" style={{ background: s.color }}></span>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(job.id)
            }}
            title="Delete Target"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard
