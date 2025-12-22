/**
 * App.jsx - Main Application Component
 *
 * Flow:
 * 1. Storage setup (pick save location)
 * 2. AI setup (choose Gemini or Ollama)
 * 3. Main app with simplified navigation (Jobs, Profile, Settings)
 */
import { useState, useEffect } from 'react'
import { Button, Card, Container, Modal, Layout } from './shared/components'
import { useStorage, useAI } from './shared/hooks'
import { AISettings } from './features/settings/components'
import { ResumeUpload } from './features/resume/components'
import { AddApplication } from './features/applications/components'
import { ContactForm, ContactsView } from './features/contacts/components'
import { JobsView } from './features/jobs/components'
import { ProfileView } from './features/profile/components'
import { LandingPage, SetupLayout } from './features/landing'
import { MOCK_DATA, MOCK_ANALYSIS } from './data/mockData'

function App() {
  const {
    data,
    isLoading,
    error,
    needsSetup,
    setupFileStorage,
    openExistingFile,
    save,
    updateAndSave,
    addApplication,
    deleteContact,
    updateContact,
    isFileSystemSupported
  } = useStorage()

  // AI hook for parsing
  const {
    parseResume,
    parseJobDescription,
    analyzeGap,
    analyzeResume,
    isProcessing: aiProcessing,
    error: aiError
  } = useAI(data?.settings)

  // Resume analysis state
  const [resumeAnalysis, setResumeAnalysis] = useState(null)

  // Track if user has started setup from landing page
  const [hasStartedSetup, setHasStartedSetup] = useState(false)

  // Track if storage has been configured (folder selected or localStorage initialized)
  const [hasConfiguredStorage, setHasConfiguredStorage] = useState(!!data)

  // Update hasConfiguredStorage when data becomes available
  useEffect(() => {
    if (data) {
      setHasConfiguredStorage(true)
    }
  }, [data])

  // Handle demo mode - load mock data and go to jobs
  const handleDemo = async () => {
    await save({ ...MOCK_DATA, isDemo: true })
    setCurrentView('jobs')
  }

  // Check if in demo mode
  const isDemo = data?.isDemo === true

  // Reset app (clears data and shows landing page)
  const handleResetApp = () => {
    localStorage.clear()
    window.location.reload()
  }

  // Logo click - go to jobs view and clean URL
  const handleLogoClick = () => {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    setCurrentView('jobs')
  }

  // Valid views for URL routing
  const validViews = ['jobs', 'contacts', 'profile', 'settings']

  // Get view from URL hash
  const getViewFromHash = () => {
    const hash = window.location.hash.slice(1) // Remove #
    return validViews.includes(hash) ? hash : 'jobs'
  }

  // Current view (jobs, contacts, profile, settings)
  const [currentView, setCurrentView] = useState(getViewFromHash)

  // Sync URL hash with view changes
  useEffect(() => {
    // Special handling for jobs view to allow both clean URL and #jobs
    if (currentView === 'jobs') {
      const isClean = !window.location.hash || window.location.hash === '#'
      const isJobsHash = window.location.hash === '#jobs'

      // Only force hash update if it's completely wrong (e.g. #settings when we are on jobs)
      if (!isClean && !isJobsHash) {
        window.location.hash = 'jobs'
      }
    } else if (window.location.hash !== `#${currentView}`) {
      window.location.hash = currentView
    }
  }, [currentView])

  // Handle hash changes (back/forward + direct hash changes)
  useEffect(() => {
    const handleHashChange = () => {
      // If we are at root (no hash), go to jobs but keep URL clean
      if (!window.location.hash) {
        setCurrentView('jobs')
        return
      }
      setCurrentView(getViewFromHash())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // View mode for jobs (list or kanban)
  const [viewMode, setViewMode] = useState('list')

  // Modal states
  const [showAddAppModal, setShowAddAppModal] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [editingJob, setEditingJob] = useState(null)

  // === HANDLERS ===

  /**
   * Handle resume parsing
   */
  const handleResumeParse = async (resumeText) => {
    console.log('Starting resume parse, text length:', resumeText.length)
    const result = await parseResume(resumeText)
    console.log('Parse result:', result)

    if (result.success) {
      await updateAndSave('resume', {
        ...result.data,
        rawText: resumeText,
        parsedAt: new Date().toISOString()
      })
      setShowResumeUpload(false)
    } else {
      console.error('Resume parse failed:', result.error)
      alert('Failed to parse resume: ' + (result.error || 'Unknown error'))
    }
  }

  /**
   * Handle resume delete
   */
  const handleResumeDelete = async () => {
    if (window.confirm('Delete your resume? This cannot be undone.')) {
      await updateAndSave('resume', null)
    }
  }

  /**
   * Handle adding application with auto gap analysis
   */
  const handleAddApplication = async (appData) => {
    // Auto-run gap analysis if we have a resume and parsed JD
    let gapAnalysis = null
    if (data?.resume && appData.parsedJD) {
      const result = await analyzeGap(data.resume, appData.parsedJD)
      if (result.success) {
        gapAnalysis = result.data
      }
    }

    await addApplication({
      ...appData,
      gapAnalysis
    })
    setShowAddAppModal(false)
    setEditingJob(null)
  }

  /**
   * Handle parsing job description
   */
  const handleParseJD = async (jdText) => {
    return parseJobDescription(jdText)
  }

  /**
   * Handle inline status update
   */
  const handleStatusChange = async (jobId, newStatus) => {
    const applications = data?.applications || []
    const updated = applications.map(app =>
      app.id === jobId
        ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
        : app
    )
    await updateAndSave('applications', updated)
  }

  /**
   * Handle job delete
   */
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this application?')) {
      const applications = (data?.applications || []).filter(a => a.id !== jobId)
      await updateAndSave('applications', applications)
    }
  }

  /**
   * Handle job edit
   */
  const handleEditJob = async (job) => {
    setEditingJob(job)
    setShowAddAppModal(true)
  }

  /**
   * Handle updating job (including contact linking)
   */
  const handleUpdateJob = async (jobId, updates) => {
    const applications = data?.applications || []
    const updated = applications.map(app =>
      app.id === jobId
        ? { ...app, ...updates, updatedAt: new Date().toISOString() }
        : app
    )
    await updateAndSave('applications', updated)
  }

  /**
   * Handle adding/updating contact
   */
  const handleSaveContact = async (contactData) => {
    // If editing from modal, add the editingContact id
    if (editingContact && !contactData.id) {
      contactData = { ...contactData, id: editingContact.id }
    }

    await updateContact(contactData)

    // Close modal if it was open
    if (showContactModal) {
      setShowContactModal(false)
      setEditingContact(null)
    }
  }

  /**
   * Handle deleting contact
   */
  const handleDeleteContact = async (id) => {
    await deleteContact(id)
  }

  /**
   * Handle resume analysis (normal or roast mode)
   */
  const handleAnalyzeResume = async (mode) => {
    if (!data?.resume) return

    // In demo mode, use mock analysis results
    if (isDemo) {
      // Simulate a brief delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResumeAnalysis(MOCK_ANALYSIS[mode] || MOCK_ANALYSIS.normal)
      return
    }

    const result = await analyzeResume(data.resume, mode)
    if (result.success) {
      setResumeAnalysis(result.data)
    } else {
      alert('Failed to analyze resume: ' + (result.error || 'Unknown error'))
    }
  }

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <SetupLayout>
        <Container>
          <Card padding="lg" className="text-center">
            <p className="text-lg">Loading...</p>
          </Card>
        </Container>
      </SetupLayout>
    )
  }

  // === LANDING PAGE (Homepage) ===
  if (needsSetup && !hasStartedSetup) {
    return <LandingPage onGetStarted={() => setHasStartedSetup(true)} onDemo={handleDemo} />
  }

  // === STORAGE SETUP SCREEN ===
  if (needsSetup && !hasConfiguredStorage) {
    return (
      <SetupLayout onBack={() => setHasStartedSetup(false)}>
        <Container size="sm">
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-4">Choose Where to Save</h2>
            <p className="text-light mb-6">
              Your data stays on your computer. Pick a folder to store it:
            </p>

            {error && (
              <div className="mb-4 p-4 text-error" style={{ background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            {isFileSystemSupported ? (
              <div className="flex flex-col gap-4">
                <Button variant="primary" size="lg" className="w-full" onClick={setupFileStorage}>
                  Create New GapTrack Folder
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={openExistingFile}>
                  Open Existing Folder
                </Button>
                <p className="text-sm text-light text-center mt-4">
                  Your data is saved locally in your browser.
                  <br />
                  Optionally sync to a folder for backup.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-light">
                  Your data will be saved in your browser's local storage.
                </p>
                <Button variant="primary" size="lg" className="w-full" onClick={setupFileStorage}>
                  Get Started
                </Button>
              </div>
            )}
          </Card>
        </Container>
      </SetupLayout>
    )
  }

  // === AI SETUP SCREEN ===
  if (!data?.settings?.aiProvider) {
    const handleAISave = async (aiSettings) => {
      await updateAndSave('settings', aiSettings)
    }

    return (
      <SetupLayout>
        <Container size="sm">
          <Card padding="lg">
            <AISettings settings={data?.settings} onSave={handleAISave} />
          </Card>
        </Container>
      </SetupLayout>
    )
  }

  // === MAIN APP WITH LAYOUT ===
  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      resumeExists={!!data?.resume}
      applicationCount={data?.applications?.length || 0}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isDemo={isDemo}
      onLogoClick={handleLogoClick}
      onExitDemo={handleResetApp}
    >
      {/* Jobs View */}
      {currentView === 'jobs' && (
        <JobsView
          jobs={data?.applications || []}
          contacts={data?.contacts || []}
          viewMode={viewMode}
          goalDate={data?.settings?.goalDate}
          onUpdateGoalDate={async (date) => {
            await updateAndSave('settings', { ...data?.settings, goalDate: date })
          }}
          onAddJob={() => {
            setEditingJob(null)
            setShowAddAppModal(true)
          }}
          onStatusChange={handleStatusChange}
          onDeleteJob={handleDeleteJob}
          onEditJob={handleEditJob}
          onUpdateJob={handleUpdateJob}
        />
      )}

      {/* Contacts View */}
      {currentView === 'contacts' && (
        <ContactsView
          contacts={data?.contacts || []}
          onAddContact={() => {
            setEditingContact(null)
            setShowContactModal(true)
          }}
          onEditContact={(contact) => {
            setEditingContact(contact)
            setShowContactModal(true)
          }}
          onDeleteContact={handleDeleteContact}
          onSaveContact={handleSaveContact}
        />
      )}

      {/* Profile/Resume View */}
      {currentView === 'profile' && (
        <ProfileView
          resume={data?.resume}
          onUpdateResume={() => setShowResumeUpload(true)}
          onAnalyzeResume={handleAnalyzeResume}
          isAnalyzing={aiProcessing}
          analysisResult={resumeAnalysis}
        />
      )}

      {/* Settings View */}
      {currentView === 'settings' && (
        <div className="settings-page">
          <AISettings
            settings={data?.settings}
            onSave={async (aiSettings) => {
              await updateAndSave('settings', aiSettings)
            }}
            onResetApp={handleResetApp}
          />
        </div>
      )}

      {/* Resume Upload Modal */}
      <Modal
        isOpen={showResumeUpload}
        onClose={() => setShowResumeUpload(false)}
        title={data?.resume ? "Update Resume" : "Upload Resume"}
        size="lg"
      >
        <ResumeUpload
          onParse={handleResumeParse}
          isProcessing={aiProcessing}
          error={aiError}
        />
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false)
          setEditingContact(null)
        }}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="md"
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => {
            setShowContactModal(false)
            setEditingContact(null)
          }}
        />
      </Modal>

      {/* Add/Edit Application Modal */}
      <Modal
        isOpen={showAddAppModal}
        onClose={() => {
          setShowAddAppModal(false)
          setEditingJob(null)
        }}
        title={editingJob ? 'Edit Application' : 'Add Application'}
        size="lg"
      >
        <AddApplication
          job={editingJob}
          contacts={data?.contacts || []}
          resume={data?.resume}
          onSubmit={handleAddApplication}
          onParseJD={handleParseJD}
          analyzeGap={analyzeGap}
          isProcessing={aiProcessing}
          error={aiError}
        />
      </Modal>

    </Layout>
  )
}

export default App
