/**
 * JobCard Component
 *
 * Expandable card showing job application with inline gap analysis.
 * Professional, polished design.
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
  const [expanded, setExpanded] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const { company, role, location, status, link, gapAnalysis, parsedJD, linkedContacts = [] } = job

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
    return '#ef4444'
  }

  const currentStatus = STATUSES.find(s => s.value === status) || STATUSES[0]

  const handleStatusChange = (newStatus) => {
    onStatusChange(job.id, newStatus)
    setShowStatusDropdown(false)
  }

  return (
    <div className={`job-card ${expanded ? 'expanded' : ''}`}>
      {/* Card Header */}
      <div className="job-card-header" onClick={() => setExpanded(!expanded)}>
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

        {/* Right: Score + Status + Expand */}
        <div className="job-card-right">
          {matchScore !== null && (
            <div
              className="match-score"
              style={{ '--score-color': getScoreColor(matchScore) }}
            >
              <svg className="score-ring" viewBox="0 0 36 36">
                <path
                  className="score-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="score-fill"
                  strokeDasharray={`${matchScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="score-text">{matchScore}%</span>
            </div>
          )}

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
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
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

          <button className={`expand-btn ${expanded ? 'expanded' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="job-card-body">
          {gapAnalysis ? (
            <>
              {gapAnalysis.summary && (
                <p className="gap-summary">{gapAnalysis.summary}</p>
              )}

              <div className="gap-grid">
                {gapAnalysis.strengths?.length > 0 && (
                  <div className="gap-card strengths">
                    <div className="gap-card-header">
                      <span className="gap-icon icon-check" />
                      <h4>Your Strengths</h4>
                      <span className="gap-count">{gapAnalysis.strengths.length}</span>
                    </div>
                    <div className="gap-list">
                      {gapAnalysis.strengths.slice(0, 4).map((s, i) => (
                        <div key={i} className="gap-item">
                          <div className="gap-item-marker" />
                          <div className="gap-item-content">
                            <span className="gap-item-title">{s.skill}</span>
                            {s.relevance && <p className="gap-item-desc">{s.relevance}</p>}
                          </div>
                        </div>
                      ))}
                      {gapAnalysis.strengths.length > 4 && (
                        <div className="gap-more">+{gapAnalysis.strengths.length - 4} more</div>
                      )}
                    </div>
                  </div>
                )}

                {gapAnalysis.gaps?.length > 0 && (
                  <div className="gap-card gaps">
                    <div className="gap-card-header">
                      <span className="gap-icon icon-alert" />
                      <h4>Gaps to Address</h4>
                      <span className="gap-count">{gapAnalysis.gaps.length}</span>
                    </div>
                    <div className="gap-list">
                      {gapAnalysis.gaps.slice(0, 4).map((g, i) => (
                        <div key={i} className="gap-item">
                          <div className="gap-item-marker" />
                          <div className="gap-item-content">
                            <span className="gap-item-title">{g.requirement}</span>
                            {g.suggestion && <p className="gap-item-desc">{g.suggestion}</p>}
                          </div>
                        </div>
                      ))}
                      {gapAnalysis.gaps.length > 4 && (
                        <div className="gap-more">+{gapAnalysis.gaps.length - 4} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {parsedJD?.keywords?.length > 0 && (
                <div className="keywords-section">
                  <span className="keywords-label">Key Skills:</span>
                  <div className="keyword-list">
                    {parsedJD.keywords.slice(0, 6).map((kw, i) => (
                      <span key={i} className="keyword">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-analysis">
              <p>No gap analysis available</p>
              <span>Upload a resume to see how you match this role</span>
            </div>
          )}

          {/* Actions */}
          <div className="job-actions">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="action-link"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M12 8.5V12.5C12 13.05 11.55 13.5 11 13.5H3C2.45 13.5 2 13.05 2 12.5V4.5C2 3.95 2.45 3.5 3 3.5H7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M10 2H14V6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M6.5 9.5L14 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                View Posting
              </a>
            )}
            <button
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(job)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              Edit
            </button>
            <button
              className="action-btn danger"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Delete this application?')) {
                  onDelete(job.id)
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M3 4H13M6 4V3C6 2.45 6.45 2 7 2H9C9.55 2 10 2.45 10 3V4M12 4V13C12 13.55 11.55 14 11 14H5C4.45 14 4 13.55 4 13V4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobCard
