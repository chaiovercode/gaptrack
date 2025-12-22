/**
 * Contact Card Component
 * Display a single contact in table row format with inline editing
 */
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ContactsView.css'

const ROLE_OPTIONS = [
  'Recruiter',
  'Hiring Manager',
  'Senior Engineer',
  'Tech Lead',
  'Peer',
  'HR',
  'Referrer',
  'Other'
]

const MAX_NOTES_WORDS = 200

function ContactCard({ contact, rowNumber, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditingInModal, setIsEditingInModal] = useState(false)
  const [edited, setEdited] = useState({ ...contact })

  // Custom Dropdown State
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)

  // Modal Dropdown State
  const [modalRoleDropdownOpen, setModalRoleDropdownOpen] = useState(false)
  const modalRoleDropdownRef = useRef(null)

  // Sync edited state when contact prop changes (after save)
  useEffect(() => {
    if (!isEditing) {
      setEdited({ ...contact })
    }
  }, [contact, isEditing])

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false)
      }
    }
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [roleDropdownOpen])

  // Handle outside click for modal dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRoleDropdownRef.current && !modalRoleDropdownRef.current.contains(event.target)) {
        setModalRoleDropdownOpen(false)
      }
    }
    if (modalRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [modalRoleDropdownOpen])

  const handleChange = (field, value) => {
    // Limit notes to MAX_NOTES_WORDS words
    if (field === 'notes') {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0)
      if (words.length > MAX_NOTES_WORDS) {
        value = words.slice(0, MAX_NOTES_WORDS).join(' ')
      }
    }
    setEdited(prev => ({ ...prev, [field]: value }))
  }

  const getWordCount = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  const handleSave = () => {
    // Explicitly include the contact id to ensure it's an update, not a new contact
    onSave({ ...edited, id: contact.id })
    setIsEditing(false)
    setRoleDropdownOpen(false)
  }

  const handleCancel = () => {
    setEdited({ ...contact })
    setIsEditing(false)
    setRoleDropdownOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  // --- Render Edit Mode ---
  if (isEditing) {
    return (
      <div className="contact-row editing">
        <div className="contact-col col-num">{rowNumber}</div>
        <div className="contact-col col-name">
          <input
            type="text"
            value={edited.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
            className="editable-cell"
            autoFocus
          />
        </div>
        <div className="contact-col col-role">
          <div className="custom-dropdown" ref={roleDropdownRef}>
            <button
              type="button"
              className={`custom-dropdown-trigger ${roleDropdownOpen ? 'open' : ''}`}
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            >
              <span className={edited.role ? '' : 'placeholder'}>
                {edited.role || 'Select...'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {roleDropdownOpen && (
              <div className="custom-dropdown-options">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`custom-dropdown-option ${edited.role === r ? 'selected' : ''}`}
                    onClick={() => {
                      handleChange('role', r)
                      setRoleDropdownOpen(false)
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="contact-col col-company">
          <input
            type="text"
            value={edited.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            onKeyDown={handleKeyDown}
            className="editable-cell"
          />
        </div>
        <div className="contact-col col-email">
          <input
            type="text"
            value={edited.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            onKeyDown={handleKeyDown}
            className="editable-cell"
          />
        </div>
        <div className="contact-col col-phone">
          <input
            type="text"
            value={edited.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            onKeyDown={handleKeyDown}
            className="editable-cell"
          />
        </div>
        <div className="contact-col col-social">
          <div className="social-edit-icons">
            <input
              type="text"
              value={edited.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-cell social-input"
              placeholder="LinkedIn"
              title="LinkedIn URL"
            />
            <input
              type="text"
              value={edited.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-cell social-input"
              placeholder="X"
              title="X handle"
            />
            <input
              type="text"
              value={edited.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-cell social-input"
              placeholder="Insta"
              title="Instagram handle"
            />
          </div>
        </div>
        <div className="contact-col col-actions">
          <button className="icon-btn save" onClick={handleSave} title="Save">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button className="icon-btn cancel" onClick={handleCancel} title="Cancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // --- Render View Mode ---
  return (
    <div className="contact-row">
      <div className="contact-col col-num">{rowNumber}</div>
      <div className="contact-col col-name" onClick={() => setIsEditing(true)}>
        <span className="contact-name">{contact.name}</span>
      </div>
      <div className="contact-col col-role" onClick={() => setIsEditing(true)}>
        <span className="contact-role" style={{
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          fontWeight: '400'
        }}>
          {contact.role || '-'}
        </span>
      </div>
      <div className="contact-col col-company" onClick={() => setIsEditing(true)}>
        <span className="contact-company">{contact.company || '-'}</span>
      </div>
      <div className="contact-col col-email" onClick={() => setIsEditing(true)}>
        {contact.email ? (
          <span className="contact-text" title={contact.email}>{contact.email}</span>
        ) : '-'}
      </div>
      <div className="contact-col col-phone" onClick={() => setIsEditing(true)}>
        {contact.phone || '-'}
      </div>
      <div className="contact-col col-social">
        <div className="social-icons">
          {contact.linkedin && (
            <a
              href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          )}
          {contact.twitter && (
            <a
              href={contact.twitter.startsWith('http') ? contact.twitter : `https://x.com/${contact.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {contact.instagram && (
            <a
              href={contact.instagram.startsWith('http') ? contact.instagram : `https://instagram.com/${contact.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {!contact.linkedin && !contact.twitter && !contact.instagram && '-'}
        </div>
      </div>
      <div className="contact-col col-actions">
        <button className="icon-btn view" onClick={(e) => { e.stopPropagation(); setShowDetail(true); }} title="View Details">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button className="icon-btn edit" onClick={() => setIsEditing(true)} title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(contact.id); }} title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* Detail Modal - rendered via Portal to escape stacking context */}
      {showDetail && createPortal(
        <div className="contact-detail-overlay" onClick={() => { setShowDetail(false); setIsEditingInModal(false); }}>
          <div className="contact-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-detail-header">
              <h2>{isEditingInModal ? 'Edit Contact' : contact.name}</h2>
              <button className="close-btn" onClick={() => { setShowDetail(false); setIsEditingInModal(false); }}>&times;</button>
            </div>
            <div className="contact-detail-body">
              {isEditingInModal ? (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <input
                      type="text"
                      className="modal-input"
                      value={edited.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <div className="modal-dropdown" ref={modalRoleDropdownRef}>
                      <button
                        type="button"
                        className={`modal-dropdown-trigger ${modalRoleDropdownOpen ? 'open' : ''}`}
                        onClick={() => setModalRoleDropdownOpen(!modalRoleDropdownOpen)}
                      >
                        <span className={edited.role ? '' : 'placeholder'}>
                          {edited.role || 'Select Role...'}
                        </span>
                        <span className="dropdown-arrow">▼</span>
                      </button>
                      {modalRoleDropdownOpen && (
                        <div className="modal-dropdown-options">
                          {ROLE_OPTIONS.map(r => (
                            <button
                              key={r}
                              type="button"
                              className={`modal-dropdown-option ${edited.role === r ? 'selected' : ''}`}
                              onClick={() => {
                                handleChange('role', r)
                                setModalRoleDropdownOpen(false)
                              }}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Company</span>
                    <input
                      type="text"
                      className="modal-input"
                      value={edited.company || ''}
                      onChange={(e) => handleChange('company', e.target.value)}
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <input
                      type="email"
                      className="modal-input"
                      value={edited.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <input
                      type="tel"
                      className="modal-input"
                      value={edited.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">LinkedIn</span>
                    <input
                      type="text"
                      className="modal-input"
                      value={edited.linkedin || ''}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">X</span>
                    <input
                      type="text"
                      className="modal-input"
                      value={edited.twitter || ''}
                      onChange={(e) => handleChange('twitter', e.target.value)}
                      placeholder="@handle or URL"
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Instagram</span>
                    <input
                      type="text"
                      className="modal-input"
                      value={edited.instagram || ''}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="@handle or URL"
                    />
                  </div>
                  <div className="detail-row detail-notes">
                    <span className="detail-label">Notes ({getWordCount(edited.notes)}/{MAX_NOTES_WORDS} words)</span>
                    <textarea
                      className="modal-textarea"
                      value={edited.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={5}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{contact.role || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{contact.company || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : '-'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">
                      {contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : '-'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Social</span>
                    <span className="detail-value">
                      <div className="social-icons-modal">
                        {contact.linkedin && (
                          <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                        {contact.twitter && (
                          <a href={contact.twitter.startsWith('http') ? contact.twitter : `https://x.com/${contact.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link" title="X">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        )}
                        {contact.instagram && (
                          <a href={contact.instagram.startsWith('http') ? contact.instagram : `https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                        {!contact.linkedin && !contact.twitter && !contact.instagram && '-'}
                      </div>
                    </span>
                  </div>
                  <div className="detail-row detail-notes">
                    <span className="detail-label">Notes</span>
                    <p className="detail-value">{contact.notes || '-'}</p>
                  </div>
                </>
              )}
            </div>
            <div className="contact-detail-footer">
              {isEditingInModal ? (
                <>
                  <button className="btn-secondary" onClick={() => { setEdited({ ...contact }); setIsEditingInModal(false); }}>Cancel</button>
                  <button className="btn-primary" onClick={() => { handleSave(); setIsEditingInModal(false); setShowDetail(false); }}>Save</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
                  <button className="btn-primary" onClick={() => setIsEditingInModal(true)}>Edit</button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ContactCard
