/**
 * AISettings Component
 *
 * Lets users choose their AI provider and configure it.
 * Options:
 * 1. Gemini - Need API key (free tier available)
 * 2. OpenAI - Need API key (paid)
 * 3. Ollama - Need Ollama running locally (100% free)
 */

import { useState, useEffect } from 'react'
import { Button, Card, Input, Modal, Toast, ToastContainer } from '../../../shared/components'
import { useAI } from '../../../shared/hooks'
import { checkOllamaStatus } from '../../../services/ai'
import './AISettings.css'

// Recommended Ollama models for structured text extraction
const RECOMMENDED_MODELS = [
  'mistral',
  'llama3.2',
  'phi3',
  'qwen2.5'
]

function AISettings({ settings, onSave, onResetApp }) {
  // Local state for form
  const [provider, setProvider] = useState(settings?.aiProvider || null)
  const [geminiKey, setGeminiKey] = useState(settings?.geminiApiKey || '')
  const [openaiKey, setOpenaiKey] = useState(settings?.openaiApiKey || '')
  const [ollamaModel, setOllamaModel] = useState(settings?.ollamaModel || '')
  const [customModel, setCustomModel] = useState('')

  // For testing connection
  const [testStatus, setTestStatus] = useState(null)
  const [testMessage, setTestMessage] = useState('')

  // Ollama status
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const [isCheckingOllama, setIsCheckingOllama] = useState(false)

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Toast for copy feedback
  const [toast, setToast] = useState(null)

  // Check Ollama status when selected
  useEffect(() => {
    if (provider === 'ollama') {
      checkOllamaModels()
    }
  }, [provider])

  const checkOllamaModels = async () => {
    setIsCheckingOllama(true)
    const status = await checkOllamaStatus()
    setOllamaStatus(status)

    // Auto-select first available model if none selected
    if (status.running && status.availableModels?.length > 0 && !ollamaModel) {
      setOllamaModel(status.availableModels[0])
    }

    setIsCheckingOllama(false)
  }

  // Get AI hook for testing
  const { testConnection } = useAI({
    aiProvider: provider,
    geminiApiKey: geminiKey,
    openaiApiKey: openaiKey,
    ollamaModel: ollamaModel || customModel
  })

  const handleTestConnection = async () => {
    setTestStatus('testing')
    setTestMessage('')

    const result = await testConnection()

    if (result.success) {
      setTestStatus('success')
      setTestMessage('Connection successful!')
    } else {
      setTestStatus('error')
      setTestMessage(result.error || 'Connection failed')
    }
  }

  const handleSave = async () => {
    const selectedModel = ollamaModel || customModel
    await onSave({
      aiProvider: provider,
      geminiApiKey: provider === 'gemini' ? geminiKey : null,
      openaiApiKey: provider === 'openai' ? openaiKey : null,
      ollamaModel: provider === 'ollama' ? selectedModel : 'mistral'
    })
    // Show confirmation toast only in settings page (not during setup)
    if (onResetApp) {
      setToast({ message: 'Settings saved!', type: 'success' })
    }
  }

  const handleModelSelect = (model) => {
    setOllamaModel(model)
    setCustomModel('')
  }

  const handleCustomModelChange = (value) => {
    setCustomModel(value)
    setOllamaModel('')
  }

  const selectedModel = ollamaModel || customModel

  // Copy command to clipboard
  const copyCommand = async (cmd) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setToast({ message: 'Copied!', type: 'success' })
    } catch (err) {
      console.error('Failed to copy:', err)
      setToast({ message: 'Failed to copy', type: 'error' })
    }
  }

  // Check if selected Ollama model is actually installed
  const isModelInstalled = selectedModel && ollamaStatus?.availableModels?.includes(selectedModel)

  const canSave = provider && (
    (provider === 'gemini' && geminiKey) ||
    (provider === 'openai' && openaiKey) ||
    (provider === 'ollama' && ollamaStatus?.running && selectedModel && isModelInstalled)
  )

  return (
    <div className="ai-settings">
      <h3 className="text-xl font-bold mb-4">Choose AI Provider</h3>

      {/* Provider Selection - Each with config below */}
      <div className="provider-options">
        {/* Gemini Option */}
        <div className="provider-group">
          <Card
            padding="md"
            className={`provider-card ${provider === 'gemini' ? 'selected' : ''}`}
            onClick={() => setProvider('gemini')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">Gemini</h4>
                <p className="text-sm text-light mt-1">
                  Fast, cloud-based.
                </p>
              </div>
              <span className="provider-badge">Cloud</span>
            </div>
          </Card>

          {/* Gemini Configuration */}
          {provider === 'gemini' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">Gemini Setup</h4>
              <Input
                label="API Key"
                type="password"
                value={geminiKey}
                onChange={setGeminiKey}
                placeholder="Paste your Gemini API key"
              />
              <p className="text-sm text-light mt-2">
                Get a free key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  aistudio.google.com
                </a>
              </p>
            </Card>
          )}
        </div>

        {/* OpenAI Option */}
        <div className="provider-group">
          <Card
            padding="md"
            className={`provider-card ${provider === 'openai' ? 'selected' : ''}`}
            onClick={() => setProvider('openai')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">OpenAI</h4>
                <p className="text-sm text-light mt-1">
                  GPT-4o vision. Pay-as-you-go pricing.
                </p>
              </div>
              <span className="provider-badge">Cloud</span>
            </div>
          </Card>

          {/* OpenAI Configuration */}
          {provider === 'openai' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">OpenAI Setup</h4>
              <Input
                label="API Key"
                type="password"
                value={openaiKey}
                onChange={setOpenaiKey}
                placeholder="Paste your OpenAI API key (sk-...)"
              />
              <p className="text-sm text-light mt-2">
                Get a key at{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  platform.openai.com
                </a>
                {' '}(pay-as-you-go)
              </p>
            </Card>
          )}
        </div>

        {/* Ollama Option */}
        <div className="provider-group">
          <Card
            padding="md"
            className={`provider-card ${provider === 'ollama' ? 'selected' : ''}`}
            onClick={() => setProvider('ollama')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">Ollama (Local)</h4>
                <p className="text-sm text-light mt-1">
                  100% private. Local AI for resume/JD parsing.
                </p>
              </div>
              <span className="provider-badge local">Local</span>
            </div>
          </Card>

          {/* Ollama Configuration */}
          {provider === 'ollama' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">Ollama Setup</h4>

              {/* Loading State */}
              {isCheckingOllama && (
                <div className="ollama-status">
                  <span>Checking Ollama status...</span>
                </div>
              )}

              {/* Status Check */}
              {!isCheckingOllama && ollamaStatus && (
                <div className={`ollama-status ${ollamaStatus.running ? 'running' : 'not-running'}`}>
                  {ollamaStatus.running ? (
                    <>
                      <span className="status-dot"></span>
                      <span>Ollama is running</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkOllamaModels}
                        className="ml-auto"
                      >
                        Refresh
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="status-dot offline"></span>
                      <span>Ollama not detected</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkOllamaModels}
                        className="ml-auto"
                      >
                        Retry
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Ollama Running - Show Models */}
              {ollamaStatus?.running && (
                <div className="mt-4">
                  <label className="text-sm font-bold">Select Model</label>

                  {/* Installed Models */}
                  {ollamaStatus.availableModels?.length > 0 ? (
                    <>
                      <p className="text-sm text-light mt-1 mb-2">
                        {ollamaStatus.availableModels.length} model(s) installed:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {ollamaStatus.availableModels.map(model => (
                          <button
                            key={model}
                            className={`model-btn ${ollamaModel === model ? 'selected' : ''}`}
                            onClick={() => handleModelSelect(model)}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="no-models-warning mt-2">
                      <p className="font-bold">No models installed!</p>
                      <p className="text-sm mt-1">
                        You need to pull a model first. Run one of these commands:
                      </p>
                    </div>
                  )}

                  {/* Custom Model Input */}
                  <div className="mt-4">
                    <Input
                      label="Or enter model name manually"
                      value={customModel}
                      onChange={handleCustomModelChange}
                      placeholder="e.g., mistral, llama3.2, phi3"
                    />
                    <p className="text-sm text-light mt-1">
                      Models that support structured JSON output work best
                    </p>
                  </div>

                  {/* Selected Model Display */}
                  {selectedModel && (
                    <div className={`selected-model mt-4 ${isModelInstalled ? '' : 'not-installed'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Selected:</span>
                        <span className="font-bold">{selectedModel}</span>
                        {isModelInstalled ? (
                          <span className="text-success text-sm">✓ Installed</span>
                        ) : (
                          <span className="text-error text-sm">✗ Not installed</span>
                        )}
                      </div>
                      {!isModelInstalled && (
                        <div className="model-install-prompt mt-3">
                          <p className="text-sm mb-2">Run this command in your terminal to install:</p>
                          <button
                            className="install-command"
                            onClick={() => copyCommand(`ollama pull ${selectedModel}`)}
                          >
                            <code>ollama pull {selectedModel}</code>
                            <span className="copy-hint">Click to copy</span>
                          </button>
                          <p className="text-sm text-light mt-2">
                            After installing, click "Refresh" above to update the model list.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Not Running - Setup Instructions */}
              {!isCheckingOllama && !ollamaStatus?.running && (
                <div className="setup-instructions mt-4">
                  <p className="font-bold mb-2">Setup Instructions:</p>
                  <ol className="text-sm">
                    <li>
                      <span className="step-label">Install Ollama:</span>
                      <code>curl -fsSL https://ollama.com/install.sh | sh</code>
                    </li>
                    <li>
                      <span className="step-label">Pull a model:</span>
                      <code>ollama pull mistral</code>
                    </li>
                    <li>
                      <span className="step-label">Start Ollama:</span>
                      <code>ollama serve</code>
                    </li>
                  </ol>
                </div>
              )}

              {/* No Models - Suggestion for text extraction */}
              {ollamaStatus?.running && ollamaStatus.availableModels?.length === 0 && (
                <div className="setup-instructions mt-4">
                  <p className="font-bold mb-2">Recommended Models for Resume/JD Parsing:</p>
                  <p className="text-sm text-light mb-3">Click a command to copy, then paste in your terminal:</p>
                  <div className="model-suggestions">
                    <button className="suggestion" onClick={() => copyCommand('ollama pull mistral')}>
                      <code>ollama pull mistral</code>
                      <span className="text-sm text-light">Best for JSON output (4.1GB) - Recommended</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull llama3.2')}>
                      <code>ollama pull llama3.2</code>
                      <span className="text-sm text-light">Lightweight alternative (2.0GB)</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull phi3')}>
                      <code>ollama pull phi3</code>
                      <span className="text-sm text-light">Microsoft's small model (2.2GB)</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull qwen2.5')}>
                      <code>ollama pull qwen2.5</code>
                      <span className="text-sm text-light">Good for structured output (4.7GB)</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Test Connection */}
      {provider && (
        <div className="mt-4 flex gap-4 items-center flex-wrap">
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || (provider === 'ollama' && !selectedModel)}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>

          {testStatus === 'success' && (
            <span className="text-success font-bold">{testMessage}</span>
          )}
          {testStatus === 'error' && (
            <span className="text-error">{testMessage}</span>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full"
        >
          {onResetApp ? 'Save' : 'Save & Continue'}
        </Button>
      </div>

      {/* Data Storage Section - Only show when onResetApp is provided (in settings page) */}
      {onResetApp && (
        <div className="storage-section pt-6" style={{ marginTop: '40px', borderTop: '2px solid var(--color-border)' }}>
          <h3 className="text-lg font-bold mb-4">Data Storage</h3>
          <Card padding="md">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">Storage Location</p>
                <p className="text-sm text-light mt-1">
                  Your data is stored locally on your device. Nothing is sent to any server.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-sm text-light mb-3">
                Want to start fresh or switch to a different setup?
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset App & Start Fresh
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset App?"
        size="sm"
      >
        <div className="reset-confirm-content">
          <p className="mb-4">
            This will clear all your data including jobs, contacts, and resume. You'll return to the setup screen.
          </p>
          <p className="text-sm text-light mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowResetConfirm(false)
                onResetApp()
              }}
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Copy Toast */}
      {toast && (
        <ToastContainer>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={2000}
            onClose={() => setToast(null)}
          />
        </ToastContainer>
      )}
    </div>
  )
}

export default AISettings
