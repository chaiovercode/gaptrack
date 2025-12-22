/**
 * Contact Form Component
 * Add/Edit contact details
 */
import { useState, useEffect, useRef } from 'react'
import { Button, Input, TextArea, Toast } from '../../../shared/components'
import './Contacts.css'

const ROLE_OPTIONS = [
  'Recruiter',
  'Hiring Manager',
  'HR',
  'Technical Interviewer',
  'Team Lead',
  'Director',
  'VP',
  'Referral',
  'Other'
]

function ContactForm({ contact, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin: '',
    notes: ''
  })
  const [showCustomRole, setShowCustomRole] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [toast, setToast] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (contact) {
      const isCustomRole = contact.role && !ROLE_OPTIONS.includes(contact.role)
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: contact.role || '',
        linkedin: contact.linkedin || '',
        notes: contact.notes || ''
      })
      setShowCustomRole(isCustomRole)
    }
  }, [contact])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleSelect = (value) => {
    if (value === 'Other') {
      setShowCustomRole(true)
      setFormData(prev => ({ ...prev, role: '' }))
    } else {
      setShowCustomRole(false)
      setFormData(prev => ({ ...prev, role: value }))
    }
    setRoleDropdownOpen(false)
  }

  const validatePhone = (phone) => {
    if (!phone) return { valid: true, error: '' }
    const phoneRegex = /^[\d\s\-+()]+$/
    const digitsOnly = phone.replace(/\D/g, '')

    if (!phoneRegex.test(phone)) {
      return { valid: false, error: 'Only numbers, spaces, +, -, () allowed' }
    }
    if (digitsOnly.length < 7) {
      return { valid: false, error: 'Phone number too short (min 7 digits)' }
    }
    if (digitsOnly.length > 15) {
      return { valid: false, error: 'Phone number too long (max 15 digits)' }
    }
    return { valid: true, error: '' }
  }

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value }))
    if (value) {
      const { error } = validatePhone(value)
      setPhoneError(error)
    } else {
      setPhoneError('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setToast({ message: 'Name is required', type: 'error' })
      return
    }
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error)
      setToast({ message: phoneValidation.error, type: 'error' })
      return
    }
    onSave(formData)
  }

  const displayRole = showCustomRole
    ? 'Other'
    : formData.role || 'Select role...'

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <Input
              placeholder="John Smith"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <div className="custom-select" ref={dropdownRef}>
              <button
                type="button"
                className={`custom-select-trigger ${roleDropdownOpen ? 'open' : ''}`}
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              >
                <span className={formData.role || showCustomRole ? '' : 'placeholder'}>
                  {displayRole}
                </span>
                <span className="custom-select-arrow">▼</span>
              </button>
              {roleDropdownOpen && (
                <div className="custom-select-options">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role}
                      type="button"
                      className={`custom-select-option ${
                        (role === 'Other' && showCustomRole) ||
                        (role === formData.role && !showCustomRole) ? 'selected' : ''
                      }`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {showCustomRole && (
              <Input
                placeholder="Enter custom role"
                value={formData.role}
                onChange={handleChange('role')}
                style={{ marginTop: 'var(--space-2)' }}
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <Input
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <Input
              placeholder="+1 555-123-4567"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={phoneError ? 'input-error' : ''}
            />
            {phoneError && <span className="field-error">{phoneError}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company</label>
            <Input
              placeholder="Company name"
              value={formData.company}
              onChange={handleChange('company')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <Input
              placeholder="linkedin.com/in/username"
              value={formData.linkedin}
              onChange={handleChange('linkedin')}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <TextArea
            placeholder="How you met, conversation topics, follow-up dates..."
            value={formData.notes}
            onChange={handleChange('notes')}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {contact ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default ContactForm
