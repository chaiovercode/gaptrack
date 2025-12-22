/**
 * KanbanBoard Component
 *
 * Drag-and-drop kanban view for job applications.
 * 5 columns: Applied, Screening, Interview, Offer, Rejected
 */
import { useState } from 'react'
import './KanbanBoard.css'

const ROW_1 = [
  { id: 'applied', label: 'Applied', color: '#6366f1' },
  { id: 'screening', label: 'Screening', color: '#8b5cf6' },
  { id: 'interview', label: 'Interview', color: '#f59e0b' },
  { id: 'offer', label: 'Offer', color: '#10b981' },
]

const ROW_2 = [
  { id: 'accepted', label: 'Accepted', color: '#059669' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
  { id: 'withdrawn', label: 'Withdrawn', color: '#6b7280' },
]

const ALL_COLUMNS = [...ROW_1, ...ROW_2]

function KanbanBoard({ jobs = [], contacts = [], onStatusChange, onDeleteJob, onEditJob }) {
  const [draggedJob, setDraggedJob] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // Ensure jobs is always an array
  const jobsList = Array.isArray(jobs) ? jobs : []

  // Group jobs by status
  const jobsByStatus = ALL_COLUMNS.reduce((acc, col) => {
    acc[col.id] = jobsList.filter(job => job.status === col.id)
    return acc
  }, {})

  // Get linked contacts for a job
  const getJobContacts = (job) => {
    if (!job.linkedContacts || job.linkedContacts.length === 0) return []
    return job.linkedContacts
      .map(id => contacts.find(c => c.id === id))
      .filter(Boolean)
  }

  const handleDragStart = (e, job) => {
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    if (draggedJob && draggedJob.status !== columnId) {
      onStatusChange(draggedJob.id, columnId)
    }
    setDraggedJob(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedJob(null)
    setDragOverColumn(null)
  }

  // Get match score color
  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--color-success)'
    if (score >= 50) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const renderColumn = (column) => (
    <div
      key={column.id}
      className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
      onDragOver={(e) => handleDragOver(e, column.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, column.id)}
    >
      <div className="column-header" style={{ borderBottomColor: column.color }}>
        <span className="column-title">{column.label}</span>
        <span className="column-count">{jobsByStatus[column.id].length}</span>
      </div>

      <div className="column-cards">
        {jobsByStatus[column.id].map(job => {
          const jobContacts = getJobContacts(job)
          return (
            <div
              key={job.id}
              className={`kanban-card ${draggedJob?.id === job.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, job)}
              onDragEnd={handleDragEnd}
              onClick={() => onEditJob(job)}
            >
              <div className="kanban-card-header">
                <span className="kanban-company">{job.company}</span>
                {job.gapAnalysis?.matchScore && (
                  <span
                    className="kanban-score"
                    style={{ background: getScoreColor(job.gapAnalysis.matchScore) }}
                  >
                    {job.gapAnalysis.matchScore}%
                  </span>
                )}
              </div>
              <h4 className="kanban-role">{job.role}</h4>
              {job.location && (
                <p className="kanban-location">{job.location}</p>
              )}
              {jobContacts.length > 0 && (
                <div className="kanban-contacts">
                  {jobContacts.slice(0, 2).map((contact) => (
                    <span key={contact.id} className="contact-tag">
                      {contact.name}
                      {contact.linkedin && <span className="contact-linkedin-badge">in</span>}
                    </span>
                  ))}
                  {jobContacts.length > 2 && (
                    <span className="contact-more">+{jobContacts.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {jobsByStatus[column.id].length === 0 && (
          <div className="column-empty">
            Drop here
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="kanban-board">
      <div className="kanban-row kanban-row-primary">
        {ROW_1.map(renderColumn)}
      </div>
      <div className="kanban-row kanban-row-secondary">
        {ROW_2.map(renderColumn)}
      </div>
    </div>
  )
}

export default KanbanBoard
