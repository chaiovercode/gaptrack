/**
 * App.jsx - Main Application Component
 *
 * Refactored to use Context API and React Router.
 */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { Button, Card, Container, Modal, Layout } from './shared/components'
import { removeDirectoryHandle } from './services/storage/indexedDB'
import { useStorageContext } from './context/StorageContext'
import { useAIContext } from './context/AIContext'
import { AISettings } from './features/settings/components'
import SettingsView from './features/settings/components/SettingsView'
import { ResumeUpload } from './features/resume/components'
import { AddApplication } from './features/applications/components'
import { ContactForm, ContactsView } from './features/contacts/components'
import { JobsView } from './features/jobs/components'
import { ProfileView } from './features/profile/components'
import { LandingPage, SetupLayout } from './features/landing'
import { MOCK_DATA, MOCK_ANALYSIS } from './data/mockData'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Context Hooks
  const {
    data,
    isLoading,
    error,
    needsSetup, // This essentially checks if AI is configured
    needsReconnect,
    setupFileStorage,
    openExistingFile,
    save,
    updateAndSave,
    addApplication,
    deleteContact,
    updateContact,
    isFileSystemSupported
  } = useStorageContext()

  const {
    parseResume,
    parseJobDescription,
    analyzeGap,
    analyzeResume,
    isProcessing: aiProcessing,
    error: aiError,
    cancel
  } = useAIContext()

  // Local UI State
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [hasStartedSetup, setHasStartedSetup] = useState(() => {
    // Check if user has already completed setup (has data stored)
    return localStorage.getItem('gaptrack-setup-complete') === 'true'
  })
  const [viewMode, setViewMode] = useState('list')

  // Modals
  const [showAddAppModal, setShowAddAppModal] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  const [editingJob, setEditingJob] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null) // { type: 'job'|'resume', id: string, name: string }

  // Derived State
  const isDemo = data?.isDemo === true
  const hasConfiguredStorage = !!data
  const currentView = location.pathname.substring(1) || 'jobs'

  // --- Demo Handling ---
  const handleDemo = async () => {
    try {
      await removeDirectoryHandle()
      localStorage.clear()
      localStorage.setItem('gaptrack-launch-demo', 'true')
      window.location.reload()
    } catch (e) {
      console.error('Failed to enter simulation mode:', e)
      alert('Could not disconnect storage. Aborting demo to protect your data.')
    }
  }

  useEffect(() => {
    if (!isLoading && localStorage.getItem('gaptrack-launch-demo')) {
      localStorage.removeItem('gaptrack-launch-demo')
      save({ ...MOCK_DATA, isDemo: true })
      setHasStartedSetup(true)
      navigate('/jobs')
    }
  }, [isLoading, save, navigate])

  const handleResetApp = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleLogoClick = () => {
    localStorage.removeItem('gaptrack-setup-complete')
    setHasStartedSetup(false)
    navigate('/')
  }

  const handleStart = async () => {
    if (isDemo || data?.resume?.name === 'Elliot Alderson') {
      try {
        await save(null)
        localStorage.removeItem('gaptrack-setup-complete')
      } catch (e) {
        console.error('Error clearing data:', e)
      }
    }
    setTimeout(() => {
      setHasStartedSetup(true)
    }, 50)
  }

  // Mark setup as complete when user has configured storage and AI
  useEffect(() => {
    if (hasConfiguredStorage && data?.settings?.aiProvider) {
      localStorage.setItem('gaptrack-setup-complete', 'true')
    }
  }, [hasConfiguredStorage, data?.settings?.aiProvider])

  // --- Handlers ---
  const handleResumeParse = async (resumeText) => {
    const result = await parseResume(resumeText)
    if (result.success) {
      await updateAndSave('resume', {
        ...result.data,
        rawText: resumeText,
        parsedAt: new Date().toISOString()
      })
      setShowResumeUpload(false)
    } else {
      alert('Failed to parse resume: ' + (result.error || 'Unknown error'))
    }
  }

  const handleResumeDelete = async () => {
    setDeleteConfirmation({
      type: 'resume',
      title: 'Purge Resume Data?',
      message: 'This will wipe your dossier from local storage. You will need to re-upload to continue analysis.'
    })
  }

  const handleAddApplication = async (appData) => {
    let gapAnalysis = appData.gapAnalysis

    // Only run auto-analysis if not already present and we have the data
    if (!gapAnalysis && data?.resume && appData.parsedJD && !appData.gapAnalysis) {
      const result = await analyzeGap(data.resume, appData.parsedJD)
      if (result.success) {
        gapAnalysis = result.data
      }
    }

    const finalData = { ...appData, gapAnalysis }

    if (appData.id) {
      // It's an update!
      await handleUpdateJob(appData.id, finalData)
    } else {
      // It's a new job
      await addApplication(finalData)
    }

    setShowAddAppModal(false)
    setEditingJob(null)
  }

  const handleStatusChange = async (jobId, newStatus) => {
    const updated = (data?.applications || []).map(app =>
      app.id === jobId ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app
    )
    await updateAndSave('applications', updated)
  }

  const handleDeleteJob = async (jobId) => {
    const job = data?.applications?.find(a => a.id === jobId)
    setDeleteConfirmation({
      type: 'job',
      id: jobId,
      title: job?.company ? `Remove target: ${job.company}?` : 'Remove this target?',
      message: 'This will delete the job and all associated notes. The system cannot recover this data.'
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    if (deleteConfirmation.type === 'job') {
      const updated = (data?.applications || []).filter(a => a.id !== deleteConfirmation.id)
      await updateAndSave('applications', updated)
    } else if (deleteConfirmation.type === 'resume') {
      await updateAndSave('resume', null)
    }

    setDeleteConfirmation(null)
  }

  const handleUpdateJob = async (jobId, updates) => {
    const updated = (data?.applications || []).map(app =>
      app.id === jobId ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    )
    await updateAndSave('applications', updated)
  }

  const handleSaveContact = async (contactData) => {
    if (editingContact && !contactData.id) {
      contactData = { ...contactData, id: editingContact.id }
    }
    await updateContact(contactData)
    if (showContactModal) {
      setShowContactModal(false)
      setEditingContact(null)
    }
  }

  const handleAnalyzeResume = async (mode) => {
    if (!data?.resume) return
    if (isDemo) {
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

  // --- Views ---

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

  // Show landing page only if setup hasn't started AND user doesn't have a fully configured app
  const isFullyConfigured = hasConfiguredStorage && data?.settings?.aiProvider
  if (!hasStartedSetup && !isFullyConfigured) {
    return <LandingPage onGetStarted={handleStart} onDemo={handleDemo} />
  }

  // Storage Setup
  if (!hasConfiguredStorage) {
    return (
      <SetupLayout onBack={() => setHasStartedSetup(false)}>
        <Container size="sm">
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-4">mount_storage</h2>
            <p className="text-light mb-6">
              data persists locally. no cloud leaks. select persistence layer:
            </p>
            {error && (
              <div className="mb-4 p-4 text-error" style={{ background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}
            {isFileSystemSupported ? (
              <div className="flex flex-col gap-4">
                <Button variant="primary" size="lg" className="w-full" onClick={setupFileStorage}>
                  initialize_new_directory
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={openExistingFile}>
                  mount_existing_volume
                </Button>
                <p className="text-sm text-light text-center mt-4">
                  filesystem access granted.<br />data redundancy: user_managed.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-light">
                  filesystem_access: denied. defaulting to browser_cache.
                </p>
                <Button variant="primary" size="lg" className="w-full" onClick={setupFileStorage}>
                  confirm_local_storage
                </Button>
              </div>
            )}
          </Card>
        </Container>
      </SetupLayout>
    )
  }

  // AI Setup
  if (!data?.settings?.aiProvider) {
    return (
      <SetupLayout>
        <Container size="sm">
          <Card padding="lg">
            <AISettings settings={data?.settings} onSave={(s) => updateAndSave('settings', s)} />
          </Card>
        </Container>
      </SetupLayout>
    )
  }

  // Main App
  return (
    <Layout
      currentView={currentView}
      onNavigate={(view) => navigate('/' + view)}
      resumeExists={!!data?.resume}
      applicationCount={data?.applications?.length || 0}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isDemo={isDemo}
      onLogoClick={handleLogoClick}
      onExitDemo={handleResetApp}
    >
      {needsReconnect && (
        <div className="reconnect-banner">
          <span>Folder connection lost. Data is cached.</span>
          <Button variant="primary" size="sm" onClick={openExistingFile}>Reconnect</Button>
        </div>
      )}

      <Routes>
        <Route path="/jobs" element={
          <JobsView
            jobs={data?.applications || []}
            contacts={data?.contacts || []}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            goalDate={data?.settings?.goalDate}
            onUpdateGoalDate={(date) => updateAndSave('settings', { ...data?.settings, goalDate: date })}
            onAddJob={() => { setEditingJob(null); setShowAddAppModal(true); }}
            onStatusChange={handleStatusChange}
            onDeleteJob={handleDeleteJob}
            onEditJob={(job) => { setEditingJob(job); setShowAddAppModal(true); }}
            onUpdateJob={handleUpdateJob}
          />
        } />

        <Route path="/contacts" element={
          <ContactsView
            contacts={data?.contacts || []}
            onAddContact={() => { setEditingContact(null); setShowContactModal(true); }}
            onEditContact={(c) => { setEditingContact(c); setShowContactModal(true); }}
            onDeleteContact={deleteContact}
            onSaveContact={handleSaveContact}
          />
        } />

        <Route path="/profile" element={
          <ProfileView
            resume={data?.resume}
            onUpdateResume={() => setShowResumeUpload(true)}
            onSaveResume={(r) => updateAndSave('resume', r)}
            onAnalyzeResume={handleAnalyzeResume}
            isAnalyzing={aiProcessing}
            analysisResult={resumeAnalysis}
          />
        } />

        <Route path="/settings" element={
          <SettingsView
            settings={data?.settings}
            onSave={(s) => updateAndSave('settings', s)}
            onResetApp={handleResetApp}
          />
        } />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/jobs" replace />} />
      </Routes>

      {/* Modals - Kept global for now */}
      <Modal
        isOpen={showResumeUpload}
        onClose={() => { cancel(); setShowResumeUpload(false); }}
        title={data?.resume ? "Update Resume" : "Upload Resume"}
        size="lg"
      >
        <ResumeUpload
          onParse={handleResumeParse}
          isProcessing={aiProcessing}
          error={aiError}
        />
      </Modal>

      <Modal
        isOpen={showContactModal}
        onClose={() => { setShowContactModal(false); setEditingContact(null); }}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="md"
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => { setShowContactModal(false); setEditingContact(null); }}
        />
      </Modal>

      <Modal
        isOpen={showAddAppModal}
        onClose={() => { cancel(); setShowAddAppModal(false); setEditingJob(null); }}
        title={editingJob ? 'edit target' : 'add target'}
        size="lg"
      >
        <AddApplication
          job={editingJob}
          contacts={data?.contacts || []}
          resume={data?.resume}
          onSubmit={handleAddApplication}
          onParseJD={parseJobDescription}
          analyzeGap={analyzeGap}
          isProcessing={aiProcessing}
          error={aiError}
          onCancel={() => { cancel(); setShowAddAppModal(false); setEditingJob(null); }}
        />
      </Modal>
      <Modal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="confirmation-modal" style={{ padding: '0 1rem 1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            {deleteConfirmation?.title}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {deleteConfirmation?.message}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              Delete Target
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default App
