/**
 * JobsView Component
 *
 * Main view showing all jobs with List/Kanban/Funnel toggle.
 * Includes filters for status, location, company, and work type.
 */
import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '../../../shared/components'
import JobCard from './JobCard'
import KanbanBoard from './KanbanBoard'
import FunnelView from './FunnelView'
import './JobsView.css'

// Custom Dropdown Component
function FilterDropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="filter-group" ref={dropdownRef}>
      <label>{label}</label>
      <div className="custom-dropdown">
        <button
          type="button"
          className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="dropdown-value">{selectedOption?.label || 'Select...'}</span>
          <span className="dropdown-arrow" />
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
              >
                {value === opt.value && <span className="option-check" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Encouraging and funny job search quotes
const QUOTES = [
  { text: "Every rejection is one step closer to an offer.", type: "encouraging" },
  { text: "Your next opportunity is just one application away.", type: "encouraging" },
  { text: "The job hunt is a marathon, not a sprint. Pace yourself.", type: "encouraging" },
  { text: "Today's effort is tomorrow's success story.", type: "encouraging" },
  { text: "You're not unemployed, you're on a talent search... for companies worthy of you.", type: "funny" },
  { text: "Remember: Even LinkedIn was rejected by investors 25 times.", type: "encouraging" },
  { text: "Plot twist: The perfect job is looking for you too.", type: "funny" },
  { text: "Rejection emails are just fan mail from companies that can't afford you.", type: "funny" },
  { text: "Your resume is great. Their loss.", type: "funny" },
  { text: "Somewhere, a hiring manager is desperately looking for someone exactly like you.", type: "encouraging" },
  { text: "Coffee first, applications second, panic never.", type: "funny" },
  { text: "You've survived 100% of your worst days. This job hunt is nothing.", type: "encouraging" },
  { text: "The right job won't need you to be someone else.", type: "encouraging" },
  { text: "Fun fact: Most people get hired. You will too.", type: "encouraging" },
  { text: "Today's awkward interview story is tomorrow's party anecdote.", type: "funny" },
]

// Get quote based on day of year (changes daily)
const getDailyQuote = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return QUOTES[dayOfYear % QUOTES.length]
}

function JobsView({
  jobs = [],
  contacts = [],
  viewMode,
  goalDate,
  onUpdateGoalDate,
  onAddJob,
  onStatusChange,
  onDeleteJob,
  onEditJob
}) {
  const dailyQuote = getDailyQuote()
  const jobsList = Array.isArray(jobs) ? jobs : []
  const funnelRef = useRef(null)

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
    company: 'all',
    workType: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [tempGoalDate, setTempGoalDate] = useState('')

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!goalDate) return null
    const target = new Date(goalDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  const formatGoalDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleEditGoal = () => {
    setTempGoalDate(goalDate || '')
    setIsEditingGoal(true)
  }

  const handleSaveGoal = () => {
    if (tempGoalDate) {
      onUpdateGoalDate(tempGoalDate)
    }
    setIsEditingGoal(false)
  }

  const handleClearGoal = () => {
    onUpdateGoalDate(null)
    setIsEditingGoal(false)
  }

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const locations = [...new Set(jobsList.map(j => j.location).filter(Boolean))]
    const companies = [...new Set(jobsList.map(j => j.company).filter(Boolean))]
    return { locations, companies }
  }, [jobsList])

  // Download jobs as CSV
  const downloadCSV = async () => {
    if (jobsList.length === 0) return

    const headers = ['ID', 'Company', 'Role', 'Location', 'Status', 'Work Type', 'Salary', 'Link', 'Notes', 'Created At', 'Updated At']
    const rows = jobsList.map(j => [
      j.id || '',
      j.company || '',
      j.role || '',
      j.location || '',
      j.status || '',
      j.workType || '',
      j.salary || '',
      j.link || '',
      j.notes || '',
      j.createdAt || '',
      j.updatedAt || ''
    ])

    const escapeCSV = (val) => {
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    const filename = `jobs-${new Date().toISOString().split('T')[0]}.csv`

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }]
        })
        const writable = await handle.createWritable()
        await writable.write(csvContent)
        await writable.close()
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Apply filters
  const filteredJobs = useMemo(() => {
    return jobsList.filter(job => {
      if (filters.status !== 'all' && job.status !== filters.status) return false
      if (filters.location !== 'all' && job.location !== filters.location) return false
      if (filters.company !== 'all' && job.company !== filters.company) return false
      if (filters.workType !== 'all' && (job.workType || 'onsite') !== filters.workType) return false
      return true
    })
  }, [jobsList, filters])

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  // Calculate pipeline stats
  const pipeline = [
    { key: 'applied', label: 'Applied', color: '#6366f1', count: jobsList.filter(j => j.status === 'applied').length },
    { key: 'screening', label: 'Screening', color: '#8b5cf6', count: jobsList.filter(j => j.status === 'screening').length },
    { key: 'interview', label: 'Interview', color: '#f59e0b', count: jobsList.filter(j => j.status === 'interview').length },
    { key: 'offer', label: 'Offer', color: '#10b981', count: jobsList.filter(j => j.status === 'offer').length },
    { key: 'accepted', label: 'Accepted', color: '#059669', count: jobsList.filter(j => j.status === 'accepted').length },
  ]

  const rejected = jobsList.filter(j => j.status === 'rejected').length
  const withdrawn = jobsList.filter(j => j.status === 'withdrawn').length
  const acceptedCount = jobsList.filter(j => j.status === 'accepted').length

  // Empty state
  if (jobsList.length === 0) {
    return (
      <div className="jobs-empty-state">
        <div className="empty-illustration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="30" width="80" height="60" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="20" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="2"/>
            <rect x="30" y="60" width="30" height="8" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="30" y="72" width="50" height="8" rx="2" fill="currentColor" opacity="0.2"/>
            <circle cx="85" cy="70" r="20" stroke="currentColor" strokeWidth="2" fill="var(--color-primary-light)"/>
            <path d="M80 70 L83 73 L90 66" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>No applications yet</h2>
        <p>Start tracking your job search by adding your first application</p>
        <Button variant="primary" size="lg" onClick={onAddJob}>
          <span className="btn-icon">+</span>
          Add Your First Job
        </Button>
      </div>
    )
  }

  return (
    <div className="jobs-view">
      <h2 className="page-title">Job Applications</h2>

      {/* Goal Countdown */}
      <div className="goal-section">
        {/* Success State - Got a job! */}
        {acceptedCount > 0 ? (
          <div className="goal-success">
            <div className="success-icon">🎉</div>
            <div className="success-message">
              <span className="success-title">Congratulations!</span>
              <span className="success-subtitle">You did it! {acceptedCount} offer{acceptedCount > 1 ? 's' : ''} accepted.</span>
            </div>
          </div>
        ) : isEditingGoal ? (
          <div className="goal-edit">
            <input
              type="date"
              value={tempGoalDate}
              onChange={(e) => setTempGoalDate(e.target.value)}
              className="goal-date-input"
            />
            <div className="goal-edit-actions">
              <button className="goal-save-btn" onClick={handleSaveGoal}>Save</button>
              <button className="goal-cancel-btn" onClick={() => setIsEditingGoal(false)}>Cancel</button>
              {goalDate && (
                <button className="goal-clear-btn" onClick={handleClearGoal}>Clear</button>
              )}
            </div>
          </div>
        ) : goalDate ? (
          <div className={`goal-display ${daysRemaining < -14 ? 'very-overdue' : ''}`}>
            <div className={`goal-countdown ${daysRemaining <= 0 ? 'overdue' : daysRemaining <= 7 ? 'urgent' : ''}`}>
              <span className="countdown-number">{Math.abs(daysRemaining)}</span>
              <span className="countdown-label">
                {daysRemaining < 0 ? 'days overdue' : daysRemaining === 0 ? 'today!' : 'days to go'}
              </span>
            </div>
            <div className="goal-info">
              <span className="goal-target">Target: {formatGoalDate(goalDate)}</span>
              <button className="goal-edit-btn" onClick={handleEditGoal}>
                {daysRemaining < -14 ? 'Set New Goal' : 'Edit'}
              </button>
            </div>
            <div className="goal-quote">
              <span className="quote-text">
                {daysRemaining < -14
                  ? '"The timeline changed, but your goal hasn\'t. Set a new target date!"'
                  : `"${dailyQuote.text}"`
                }
              </span>
            </div>
          </div>
        ) : (
          <div className="goal-empty">
            <button className="goal-set-btn" onClick={handleEditGoal}>
              <span className="goal-set-icon">+</span>
              Set a goal date
            </button>
            <div className="goal-quote">
              <span className="quote-text">"{dailyQuote.text}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Header Bar */}
      <div className="jobs-header">
        <div className="pipeline-stats">
          {pipeline.map((stage, i) => (
            <div key={stage.key} className="pipeline-stage">
              <div className="stage-content">
                <span className="stage-count" style={{ color: stage.color }}>{stage.count}</span>
                <span className="stage-label">{stage.label}</span>
              </div>
              {i < pipeline.length - 1 && <div className="stage-arrow" />}
            </div>
          ))}
        </div>
        {(rejected > 0 || withdrawn > 0) && (
          <div className="pipeline-secondary">
            {rejected > 0 && (
              <span className="secondary-stat rejected">{rejected} rejected</span>
            )}
            {withdrawn > 0 && (
              <span className="secondary-stat withdrawn">{withdrawn} withdrawn</span>
            )}
          </div>
        )}
        <div className="header-spacer"></div>
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="filter-icon" />
          Filters
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>
        {jobsList.length > 0 && (
          <button
            className="csv-btn"
            onClick={() => viewMode === 'funnel' ? funnelRef.current?.downloadPNG() : downloadCSV()}
            title={viewMode === 'funnel' ? 'Download PNG' : 'Download CSV'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        )}
        <Button variant="primary" onClick={onAddJob}>
          <span className="btn-icon">+</span>
          Add Job
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <FilterDropdown
            label="Status"
            value={filters.status}
            onChange={(v) => setFilters(f => ({ ...f, status: v }))}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'applied', label: 'Applied' },
              { value: 'screening', label: 'Screening' },
              { value: 'interview', label: 'Interviewing' },
              { value: 'offer', label: 'Offer Received' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ]}
          />
          <FilterDropdown
            label="Location"
            value={filters.location}
            onChange={(v) => setFilters(f => ({ ...f, location: v }))}
            options={[
              { value: 'all', label: 'All Locations' },
              ...filterOptions.locations.map(loc => ({ value: loc, label: loc }))
            ]}
          />
          <FilterDropdown
            label="Company"
            value={filters.company}
            onChange={(v) => setFilters(f => ({ ...f, company: v }))}
            options={[
              { value: 'all', label: 'All Companies' },
              ...filterOptions.companies.map(comp => ({ value: comp, label: comp }))
            ]}
          />
          <FilterDropdown
            label="Work Type"
            value={filters.workType}
            onChange={(v) => setFilters(f => ({ ...f, workType: v }))}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'onsite', label: 'On-site' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'remote', label: 'Remote' },
            ]}
          />
          {activeFilterCount > 0 && (
            <button
              className="clear-filters"
              onClick={() => setFilters({ status: 'all', location: 'all', company: 'all', workType: 'all' })}
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {filteredJobs.length === 0 && jobsList.length > 0 ? (
        <div className="no-results">
          <p>No jobs match your filters</p>
          <button onClick={() => setFilters({ status: 'all', location: 'all', company: 'all', workType: 'all' })}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'funnel' ? (
        <FunnelView
          ref={funnelRef}
          jobs={filteredJobs}
          contacts={contacts}
          onStatusChange={onStatusChange}
          onEditJob={onEditJob}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          jobs={filteredJobs}
          contacts={contacts}
          onStatusChange={onStatusChange}
          onDeleteJob={onDeleteJob}
          onEditJob={onEditJob}
        />
      ) : (
        <div className="jobs-list">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              contacts={contacts}
              onStatusChange={onStatusChange}
              onDelete={onDeleteJob}
              onEdit={onEditJob}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobsView
