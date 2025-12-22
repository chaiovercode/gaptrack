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
  { value: 'discovered', label: 'Targeted', color: '#94a3b8' },
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
  const [status, setStatus] = useState('discovered')
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
      setStatus(job.status || 'discovered')
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

    // Trigger parse manually
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
      setToast({ message: 'company and role are required', type: 'error' })
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
          <h3>decoding their requirements</h3>
          <p>extracting what they actually want vs what they say they want...</p>
          <Button variant="outline" onClick={onCancel} style={{ marginTop: '2rem' }}>
            abort_process
          </Button>
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
        {/* Hero Paste Area - only show when adding new */}
        {!job && (
          <div className="paste-hero">
            <div className="paste-hero-header">
              <div className="paste-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <div>
                <h3>paste their job posting</h3>
                <p>let me decode what they're really looking for</p>
              </div>
            </div>
            <TextArea
              className="paste-textarea"
              placeholder="paste the job posting here...
    
the more detail, the better i can find your gaps before they do."
              value={jobDescription}
              onChange={handleJDPaste}
              rows={5}
            />

            <div className="paste-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="primary"
                onClick={handleManualParse}
                disabled={!jobDescription.trim() || isProcessing}
              >
                DECODE
              </Button>
            </div>

            {parsedJD && !isProcessing && (
              <div className="paste-status success">
                <span className="status-check">✓</span>
                extracted
              </div>
            )}
          </div>
        )}

        {/* Match Score Card */}
        {(matchPreview || analyzingMatch) && (
          <div className={`match-card ${matchPreview ? 'show' : ''}`}>
            {analyzingMatch ? (
              <div className="match-loading">
                <div className="match-loading-bar"></div>
                <span>calculating match score...</span>
              </div>
            ) : (
              <>
                <div className="match-header">
                  <span
                    className="match-score-value"
                    style={{
                      '--score-color': matchPreview.matchScore >= 70
                        ? '#10b981'
                        : matchPreview.matchScore >= 50
                          ? '#f59e0b'
                          : '#A9070E'
                    }}
                  >
                    {matchPreview.matchScore}%
                  </span>
                  <div className="match-details">
                    <h4>
                      {matchPreview.matchScore >= 70 ? 'you\'re in good shape' :
                        matchPreview.matchScore >= 50 ? 'survivable odds' : 'uphill battle'}
                    </h4>
                    <p>{matchPreview.summary}</p>
                  </div>
                </div>

                {/* Gap Analysis Details */}
                <div className="gap-analysis-grid">
                  {matchPreview.strengths?.length > 0 && (
                    <div className="gap-analysis-card strengths">
                      <div className="gap-analysis-header">
                        <span className="gap-icon">✓</span>
                        <h5>what you've got</h5>
                        <span className="gap-count">{matchPreview.strengths.length}</span>
                      </div>
                      <ul className="gap-list">
                        {matchPreview.strengths.slice(0, 5).map((s, i) => (
                          <li key={i}>
                            <span className="gap-skill">{s.skill}</span>
                            {s.relevance && <span className="gap-relevance">{s.relevance}</span>}
                          </li>
                        ))}
                        {matchPreview.strengths.length > 5 && (
                          <li className="gap-more">+{matchPreview.strengths.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {matchPreview.gaps?.length > 0 && (
                    <div className="gap-analysis-card gaps">
                      <div className="gap-analysis-header">
                        <span className="gap-icon">!</span>
                        <h5>what they'll reject you for</h5>
                        <span className="gap-count">{matchPreview.gaps.length}</span>
                      </div>
                      <ul className="gap-list">
                        {matchPreview.gaps.slice(0, 5).map((g, i) => (
                          <li key={i}>
                            <span className="gap-skill">{g.requirement}</span>
                            {g.suggestion && <span className="gap-relevance">{g.suggestion}</span>}
                          </li>
                        ))}
                        {matchPreview.gaps.length > 5 && (
                          <li className="gap-more">+{matchPreview.gaps.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Job Details Section */}
        <div className={`details-section ${showDetails || job ? 'show' : ''}`}>
          <div className="section-header">
            <h4>job details</h4>
            {parsedJD && <span className="auto-filled-badge">auto-filled</span>}
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>company <span className="required">*</span></label>
              <Input
                placeholder="company name..."
                value={company}
                onChange={(v) => { manualEdits.current.company = true; setCompany(v) }}
              />
            </div>
            <div className="form-field">
              <label>role <span className="required">*</span></label>
              <Input
                placeholder="job title..."
                value={role}
                onChange={(v) => { manualEdits.current.role = true; setRole(v) }}
              />
            </div>
            <div className="form-field">
              <label>location</label>
              <Input
                placeholder="city, remote..."
                value={location}
                onChange={(v) => { manualEdits.current.location = true; setLocation(v) }}
              />
            </div>
            <div className="form-field">
              <label>work type</label>
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
              <label>salary</label>
              <Input
                placeholder="$150k - $200k"
                value={salary}
                onChange={(v) => { manualEdits.current.salary = true; setSalary(v) }}
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="form-field">
            <label>status</label>
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
            <label>job posting url</label>
            <Input
              placeholder="https://..."
              value={link}
              onChange={setLink}
            />
          </div>
        </div>

        {/* Requirements Section */}
        {parsedJD && (
          <div className="requirements-section">
            <div className="section-header">
              <h4>extracted requirements</h4>
            </div>

            <div className="requirements-grid">
              {parsedJD.requirements?.mustHave?.length > 0 && (
                <div className="requirement-card must-have">
                  <h5>
                    <span className="req-icon">!</span>
                    must have
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
                    nice to have
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
                <span className="keywords-label">keywords:</span>
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
              <h4>link contacts</h4>
              <span className="section-hint">your inside connections</span>
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
            <h4>notes</h4>
          </div>
          <TextArea
            placeholder="intel, observations, red flags..."
            value={notes}
            onChange={setNotes}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              cancel
            </Button>
          )}
          <Button type="submit" variant="primary">
            {job ? 'update' : 'add target'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddApplication
