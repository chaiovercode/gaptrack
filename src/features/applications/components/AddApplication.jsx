/**
 * Add Application Component
 *
 * A polished, professional job application form.
 * Paste a JD and watch the magic happen.
 */
import { useState, useRef, useEffect } from 'react'
import { Button, Input, TextArea, Toast } from '../../../shared/components'
import './AddApplication.css'

const STATUSES = [
  { value: 'applied', label: 'Applied', color: '#6366f1' },
  { value: 'screening', label: 'Screening', color: '#8b5cf6' },
  { value: 'interview', label: 'Interviewing', color: '#f59e0b' },
  { value: 'offer', label: 'Offer Received', color: '#10b981' },
  { value: 'accepted', label: 'Accepted', color: '#059669' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#6b7280' }
]

const WORK_TYPES = [
  { value: 'onsite', label: 'On-site', color: '#6366f1' },
  { value: 'hybrid', label: 'Hybrid', color: '#8b5cf6' },
  { value: 'remote', label: 'Remote', color: '#10b981' }
]

const MIN_PASTE_LENGTH = 200

function AddApplication({
  job,
  contacts = [],
  resume,
  onSubmit,
  onCancel,
  onParseJD,
  analyzeGap,
  isProcessing,
  error
}) {
  // Form state
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [workType, setWorkType] = useState('onsite')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('applied')
  const [jobDescription, setJobDescription] = useState('')
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')
  const [linkedContacts, setLinkedContacts] = useState([])
  const [toast, setToast] = useState(null)

  // Parsed JD data
  const [parsedJD, setParsedJD] = useState(null)
  const [autoParseTriggered, setAutoParseTriggered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Match score preview
  const [matchPreview, setMatchPreview] = useState(null)
  const [analyzingMatch, setAnalyzingMatch] = useState(false)

  // Track manual edits
  const manualEdits = useRef({ company: false, role: false, location: false, salary: false })

  // Initialize form if editing
  useEffect(() => {
    if (job) {
      setCompany(job.company || '')
      setRole(job.role || '')
      setLocation(job.location || '')
      setWorkType(job.workType || 'onsite')
      setSalary(job.salary || '')
      setStatus(job.status || 'applied')
      setJobDescription(job.jobDescription || '')
      setLink(job.link || '')
      setNotes(job.notes || '')
      setLinkedContacts(job.linkedContacts || [])
      setParsedJD(job.parsedJD || null)
      setMatchPreview(job.gapAnalysis || null)
      setAutoParseTriggered(!!job.parsedJD)
      setShowDetails(true)
    }
  }, [job])

  const handleJDPaste = async (pastedText) => {
    setJobDescription(pastedText)

    if (pastedText.length >= MIN_PASTE_LENGTH && !autoParseTriggered) {
      setAutoParseTriggered(true)

      setTimeout(async () => {
        const result = await onParseJD(pastedText)
        if (result.success && result.data) {
          applyParsedData(result.data)
          setShowDetails(true)

          if (resume && analyzeGap) {
            setAnalyzingMatch(true)
            const gapResult = await analyzeGap(resume, result.data)
            if (gapResult.success) {
              setMatchPreview(gapResult.data)
            }
            setAnalyzingMatch(false)
          }
        }
      }, 100)
    }
  }

  const applyParsedData = (data) => {
    setParsedJD(data)
    if (data.company && !manualEdits.current.company) setCompany(data.company)
    if (data.role && !manualEdits.current.role) setRole(data.role)
    if (data.location && !manualEdits.current.location) setLocation(data.location)
    if (data.salary && !manualEdits.current.salary) setSalary(data.salary)
  }

  const handleManualParse = async () => {
    if (!jobDescription.trim()) return

    const result = await onParseJD(jobDescription)
    if (result.success && result.data) {
      applyParsedData(result.data)
      setShowDetails(true)

      if (resume && analyzeGap) {
        setAnalyzingMatch(true)
        const gapResult = await analyzeGap(resume, result.data)
        if (gapResult.success) {
          setMatchPreview(gapResult.data)
        }
        setAnalyzingMatch(false)
      }
    }
  }

  const toggleContact = (contactId) => {
    setLinkedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!company.trim() || !role.trim()) {
      setToast({ message: 'Company and Role are required', type: 'error' })
      return
    }

    onSubmit({
      id: job?.id,
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || null,
      workType,
      salary: salary.trim() || null,
      status,
      jobDescription: jobDescription.trim() || null,
      parsedJD,
      link: link.trim() || null,
      notes: notes.trim() || null,
      linkedContacts,
      gapAnalysis: matchPreview
    })
  }

  // Processing overlay
  if (isProcessing && !analyzingMatch) {
    return (
      <div className="add-app">
        <div className="add-app-processing">
          <div className="processing-animation">
            <div className="processing-ring"></div>
            <div className="processing-ring"></div>
            <div className="processing-ring"></div>
          </div>
          <h3>Analyzing Job Description</h3>
          <p>Extracting requirements, skills, and keywords...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="add-app">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {error && (
        <div className="add-app-error">
          <span className="error-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      <form className="add-app-form" onSubmit={handleSubmit}>
        {/* Hero Paste Area */}
        <div className="paste-hero">
          <div className="paste-hero-header">
            <div className="paste-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <div>
              <h3>Paste Job Description</h3>
              <p>AI extracts company, role, requirements automatically</p>
            </div>
          </div>
          <TextArea
            className="paste-textarea"
            placeholder="Paste the full job posting from LinkedIn, Indeed, or company website...

Example:
About the role
We're looking for a Senior Software Engineer to join our team...

Requirements:
- 5+ years of experience with React
- Strong TypeScript skills
..."
            value={jobDescription}
            onChange={handleJDPaste}
            rows={5}
          />
          {jobDescription.length > 0 && jobDescription.length < MIN_PASTE_LENGTH && (
            <div className="paste-hint">
              Keep pasting... ({MIN_PASTE_LENGTH - jobDescription.length} more characters for auto-analysis)
            </div>
          )}
          {isProcessing && (
            <div className="paste-status analyzing">
              <span className="status-dot"></span>
              Analyzing job description...
            </div>
          )}
          {parsedJD && !isProcessing && (
            <div className="paste-status success">
              <span className="status-check">✓</span>
              Job details extracted successfully
            </div>
          )}
        </div>

        {/* Match Score Card */}
        {(matchPreview || analyzingMatch) && (
          <div className={`match-card ${matchPreview ? 'show' : ''}`}>
            {analyzingMatch ? (
              <div className="match-loading">
                <div className="match-loading-bar"></div>
                <span>Calculating your match score...</span>
              </div>
            ) : (
              <>
                <div className="match-score-display">
                  <div
                    className="match-score-circle"
                    style={{
                      '--score': matchPreview.matchScore,
                      '--color': matchPreview.matchScore >= 70
                        ? 'var(--color-success)'
                        : matchPreview.matchScore >= 50
                        ? 'var(--color-warning)'
                        : 'var(--color-error)'
                    }}
                  >
                    <span className="score-number">{matchPreview.matchScore}</span>
                    <span className="score-percent">%</span>
                  </div>
                  <div className="match-details">
                    <h4>
                      {matchPreview.matchScore >= 70 ? 'Strong Match!' :
                       matchPreview.matchScore >= 50 ? 'Good Potential' : 'Stretch Role'}
                    </h4>
                    <p>{matchPreview.summary}</p>
                    {matchPreview.gaps?.length > 0 && (
                      <div className="match-gaps-count">
                        <span className="gap-dot"></span>
                        {matchPreview.gaps.length} skill gap{matchPreview.gaps.length !== 1 ? 's' : ''} to address
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Job Details Section */}
        <div className={`details-section ${showDetails || job ? 'show' : ''}`}>
          <div className="section-header">
            <h4>Job Details</h4>
            {parsedJD && <span className="auto-filled-badge">Auto-filled</span>}
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Company <span className="required">*</span></label>
              <Input
                placeholder="Google, Meta, Stripe..."
                value={company}
                onChange={(v) => { manualEdits.current.company = true; setCompany(v) }}
              />
            </div>
            <div className="form-field">
              <label>Role <span className="required">*</span></label>
              <Input
                placeholder="Senior Software Engineer"
                value={role}
                onChange={(v) => { manualEdits.current.role = true; setRole(v) }}
              />
            </div>
            <div className="form-field">
              <label>Location</label>
              <Input
                placeholder="San Francisco, NYC, London..."
                value={location}
                onChange={(v) => { manualEdits.current.location = true; setLocation(v) }}
              />
            </div>
            <div className="form-field">
              <label>Work Type</label>
              <div className="worktype-pills">
                {WORK_TYPES.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    className={`worktype-pill ${workType === w.value ? 'active' : ''}`}
                    onClick={() => setWorkType(w.value)}
                    style={{ '--worktype-color': w.color }}
                  >
                    <span className="worktype-pill-dot" />
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Salary</label>
              <Input
                placeholder="$150k - $200k"
                value={salary}
                onChange={(v) => { manualEdits.current.salary = true; setSalary(v) }}
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="form-field">
            <label>Status</label>
            <div className="status-pills">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`status-pill ${status === s.value ? 'active' : ''}`}
                  onClick={() => setStatus(s.value)}
                  style={{ '--status-color': s.color }}
                >
                  <span className="status-pill-dot" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Link */}
          <div className="form-field">
            <label>Job Posting URL</label>
            <Input
              placeholder="https://linkedin.com/jobs/view/..."
              value={link}
              onChange={setLink}
            />
          </div>
        </div>

        {/* Requirements Section */}
        {parsedJD && (
          <div className="requirements-section">
            <div className="section-header">
              <h4>Extracted Requirements</h4>
            </div>

            <div className="requirements-grid">
              {parsedJD.requirements?.mustHave?.length > 0 && (
                <div className="requirement-card must-have">
                  <h5>
                    <span className="req-icon">!</span>
                    Must Have
                  </h5>
                  <ul>
                    {parsedJD.requirements.mustHave.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsedJD.requirements?.niceToHave?.length > 0 && (
                <div className="requirement-card nice-to-have">
                  <h5>
                    <span className="req-icon">+</span>
                    Nice to Have
                  </h5>
                  <ul>
                    {parsedJD.requirements.niceToHave.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {parsedJD.keywords?.length > 0 && (
              <div className="keywords-row">
                <span className="keywords-label">Keywords:</span>
                <div className="keyword-tags">
                  {parsedJD.keywords.slice(0, 8).map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contacts Section */}
        {contacts.length > 0 && (
          <div className="contacts-section">
            <div className="section-header">
              <h4>Link Contacts</h4>
              <span className="section-hint">People connected to this opportunity</span>
            </div>
            <div className="contact-list">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  type="button"
                  className={`contact-item ${linkedContacts.includes(contact.id) ? 'selected' : ''}`}
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="contact-avatar">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{contact.name}</span>
                    {contact.role && <span className="contact-role">{contact.role}</span>}
                  </div>
                  <div className="contact-check">
                    {linkedContacts.includes(contact.id) && '✓'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="notes-section">
          <div className="section-header">
            <h4>Notes</h4>
          </div>
          <TextArea
            placeholder="Interview prep notes, referral info, follow-up reminders..."
            value={notes}
            onChange={setNotes}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary">
            {job ? 'Update Application' : 'Add Application'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddApplication
