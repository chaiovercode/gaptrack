// ContactsView.jsx
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Button } from '../../../shared/components'
import ContactCard from './ContactCard'
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

function ContactsView({
  contacts = [],
  onAddContact,
  onEditContact,
  onDeleteContact,
  onSaveContact
}) {
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  // Inline add state
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    notes: ''
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const MAX_NOTES_WORDS = 200

  const handleNewContactChange = (field, value) => {
    // Limit notes to MAX_NOTES_WORDS words
    if (field === 'notes') {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0)
      if (words.length > MAX_NOTES_WORDS) {
        value = words.slice(0, MAX_NOTES_WORDS).join(' ')
      }
    }
    setNewContact(prev => ({ ...prev, [field]: value }))
  }

  const handleQuickAdd = () => {
    if (!newContact.name.trim()) return

    if (onSaveContact) {
      onSaveContact(newContact)
    }
    // Reset form
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      notes: ''
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newContact.name.trim()) {
      handleQuickAdd()
    }
  }

  // Ensure contacts is always an array
  const contactsList = Array.isArray(contacts) ? contacts : []

  // Get unique companies for filter
  const companies = useMemo(() => {
    return [...new Set(contactsList.map(c => c.company).filter(Boolean))].sort()
  }, [contactsList])

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contactsList.filter(contact => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.role?.toLowerCase().includes(searchLower) ||
          contact.notes?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      // Company filter
      if (companyFilter !== 'all' && contact.company !== companyFilter) {
        return false
      }
      return true
    })
  }, [contactsList, search, companyFilter])

  const hasActiveFilters = search || companyFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setCompanyFilter('all')
  }

  // Download contacts as CSV
  const downloadCSV = async () => {
    if (contactsList.length === 0) return

    const headers = ['ID', 'Name', 'Role', 'Company', 'Email', 'Phone', 'LinkedIn', 'X (Twitter)', 'Instagram', 'Notes', 'Created At', 'Updated At']
    const rows = contactsList.map(c => [
      c.id || '',
      c.name || '',
      c.role || '',
      c.company || '',
      c.email || '',
      c.phone || '',
      c.linkedin || '',
      c.twitter || '',
      c.instagram || '',
      c.notes || '',
      c.createdAt || '',
      c.updatedAt || ''
    ])

    // Escape CSV values
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

    const filename = `contacts-${new Date().toISOString().split('T')[0]}.csv`

    // Try File System Access API first (modern browsers)
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'CSV File',
            accept: { 'text/csv': ['.csv'] }
          }]
        })
        const writable = await handle.createWritable()
        await writable.write(csvContent)
        await writable.close()
        return
      } catch (err) {
        // User cancelled or error, fall back to download
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: blob download
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

  // Parse CSV content with flexible column matching
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
    const contacts = []

    // Flexible column name mapping
    const columnMap = {
      name: ['name', 'fullname', 'full_name', 'contactname', 'contact'],
      role: ['role', 'title', 'jobtitle', 'job_title', 'position'],
      company: ['company', 'organization', 'org', 'employer', 'workplace'],
      email: ['email', 'emailaddress', 'email_address', 'mail', 'e_mail'],
      phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'cell', 'telephone', 'tel'],
      linkedin: ['linkedin', 'linkedinurl', 'linkedin_url', 'linkedinprofile'],
      twitter: ['twitter', 'xtwitter', 'x', 'twitterhandle', 'twitter_handle'],
      instagram: ['instagram', 'insta', 'ig', 'instagramhandle'],
      notes: ['notes', 'note', 'comments', 'comment', 'description', 'bio']
    }

    // Find which header index maps to which field
    const fieldIndexMap = {}
    headers.forEach((header, index) => {
      for (const [field, aliases] of Object.entries(columnMap)) {
        if (aliases.includes(header)) {
          fieldIndexMap[field] = index
          break
        }
      }
    })

    for (let i = 1; i < lines.length; i++) {
      const values = []
      let current = ''
      let inQuotes = false

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const contact = {}
      for (const [field, index] of Object.entries(fieldIndexMap)) {
        if (values[index]) {
          contact[field] = values[index]
        }
      }

      // Only add if has a name
      if (contact.name) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  // Import contacts from CSV
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        const importedContacts = parseCSV(text)
        if (importedContacts.length > 0) {
          // Save each imported contact
          importedContacts.forEach(contact => {
            if (onSaveContact) {
              onSaveContact(contact)
            }
          })
          alert(`Imported ${importedContacts.length} contact(s)`)
        } else {
          alert('No valid contacts found in CSV')
        }
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onSaveContact])

  return (
    <div className="contacts-view">
      <div className="contacts-view-header">
        <div className="contacts-view-title">
          <h1>Contacts</h1>
          <span className="contacts-total">{contactsList.length}</span>
        </div>
        <div className="contacts-header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <button className="import-btn" onClick={() => fileInputRef.current?.click()} title="Import from CSV">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import
          </button>
          {contactsList.length > 0 && (
            <button className="download-btn" onClick={downloadCSV} title="Download as CSV">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </button>
          )}
        </div>
      </div>

      {contactsList.length > 0 && (
        <div className="contacts-toolbar">
          <div className="contacts-search">
            <span className="search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                &times;
              </button>
            )}
          </div>

          {companies.length > 1 && (
            <div className="contacts-filter">
              <label>Company</label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button className="contacts-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}

          {hasActiveFilters && (
            <span className="contacts-results">
              {filteredContacts.length} of {contactsList.length}
            </span>
          )}
        </div>
      )}

      <div className="contacts-content">
        <div className="contacts-table">
          {/* Column Headers */}
          <div className="contacts-header-row">
            <div className="contact-col col-num">#</div>
            <div className="contact-col col-name">Name</div>
            <div className="contact-col col-role">Role</div>
            <div className="contact-col col-company">Company</div>
            <div className="contact-col col-email">Email</div>
            <div className="contact-col col-phone">Phone</div>
            <div className="contact-col col-social">Social</div>
            <div className="contact-col col-actions">Actions</div>
          </div>

          {/* Contact Rows */}
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                rowNumber={index + 1}
                onSave={onSaveContact} // Reusing onSave for updates too for now, or update prop
                onDelete={onDeleteContact}
              />
            ))
          ) : contactsList.length > 0 ? (
            <div className="contacts-no-results-row">
              <span>No contacts match your search</span>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : null}

          {/* Inline Add Row */}
          <div className="contact-row add-row">
            <div className="contact-col col-num">
              <span className="add-icon" style={{ color: 'var(--color-primary)', fontSize: 18 }}>+</span>
            </div>
            <div className="contact-col col-name">
              <input
                type="text"
                placeholder="Name *"
                value={newContact.name}
                onChange={(e) => handleNewContactChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="editable-cell"
              />
            </div>
            <div className="contact-col col-role">
              <div className="custom-dropdown" ref={roleDropdownRef}>
                <button
                  type="button"
                  className={`custom-dropdown-trigger ${roleDropdownOpen ? 'open' : ''}`}
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                >
                  <span className={newContact.role ? '' : 'placeholder'}>
                    {newContact.role || 'Select Role...'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {roleDropdownOpen && (
                  <div className="custom-dropdown-options">
                    {ROLE_OPTIONS.map(role => (
                      <button
                        key={role}
                        type="button"
                        className={`custom-dropdown-option ${newContact.role === role ? 'selected' : ''}`}
                        onClick={() => {
                          handleNewContactChange('role', role)
                          setRoleDropdownOpen(false)
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="contact-col col-company">
              <input
                type="text"
                placeholder="Company"
                value={newContact.company}
                onChange={(e) => handleNewContactChange('company', e.target.value)}
                onKeyDown={handleKeyDown}
                className="editable-cell"
              />
            </div>
            <div className="contact-col col-email">
              <input
                type="email"
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => handleNewContactChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className="editable-cell"
              />
            </div>
            <div className="contact-col col-phone">
              <input
                type="tel"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => handleNewContactChange('phone', e.target.value)}
                onKeyDown={handleKeyDown}
                className="editable-cell"
              />
            </div>
            <div className="contact-col col-social">
              <div className="social-edit-icons">
                <input
                  type="text"
                  placeholder="LinkedIn"
                  value={newContact.linkedin}
                  onChange={(e) => handleNewContactChange('linkedin', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="editable-cell social-input"
                  title="LinkedIn URL"
                />
                <input
                  type="text"
                  placeholder="X"
                  value={newContact.twitter}
                  onChange={(e) => handleNewContactChange('twitter', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="editable-cell social-input"
                  title="X/Twitter handle"
                />
                <input
                  type="text"
                  placeholder="Insta"
                  value={newContact.instagram}
                  onChange={(e) => handleNewContactChange('instagram', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="editable-cell social-input"
                  title="Instagram handle"
                />
              </div>
            </div>
            <div className="contact-col col-actions">
              <button
                className="add-confirm-btn"
                onClick={handleQuickAdd}
                disabled={!newContact.name.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactsView
