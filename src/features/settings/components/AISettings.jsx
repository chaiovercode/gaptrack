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
  const [provider, setProvider] = useState(null)
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
      <h3 className="text-xl font-bold mb-4 font-mono">configure_daemon</h3>

      {/* Provider Selection - Each with config below */}
      {/* Provider Selection - Each with config below */}
      {/* Provider Selection - Each with config below */}
      <div className="provider-options">
        {/* Ollama Option - FIRST PRIORITY */}
        <div className="provider-group">
          <Card
            padding="md"
            className={`provider-card ${provider === 'ollama' ? 'selected' : ''}`}
            onClick={() => setProvider(provider === 'ollama' ? null : 'ollama')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">ollama (local)</h4>
                <p className="text-sm text-light mt-1">
                  local instance. air-gapped logic. strictly need-to-know.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="provider-badges">
                  {settings?.ollamaModel && <span className="provider-badge configured">active</span>}
                  <span className="provider-badge local">secure</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chevron-icon"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </Card>

          {/* Ollama Configuration */}
          {provider === 'ollama' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">local_host setup</h4>

              {/* Loading State */}
              {isCheckingOllama && (
                <div className="ollama-status">
                  <span>pinging localhost:11434...</span>
                </div>
              )}

              {/* Status Check */}
              {!isCheckingOllama && ollamaStatus && (
                <div className={`ollama-status ${ollamaStatus.running ? 'running' : 'not-running'}`}>
                  {ollamaStatus.running ? (
                    <>
                      <span className="status-dot"></span>
                      <span>daemon active</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkOllamaModels}
                        className="ml-auto"
                      >
                        refresh_signal
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="status-dot offline"></span>
                      <span>connection refused</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkOllamaModels}
                        className="ml-auto"
                      >
                        retry_handshake
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Ollama Running - Show Models */}
              {ollamaStatus?.running && (
                <div className="mt-4">
                  <label className="text-sm font-bold">select_model</label>

                  {/* Installed Models */}
                  {ollamaStatus.availableModels?.length > 0 ? (
                    <>
                      <p className="text-sm text-light mt-1 mb-2">
                        {ollamaStatus.availableModels.length} compatible models found:
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
                      <p className="font-bold">model_registry empty</p>
                      <p className="text-sm mt-1">
                        pull necessary files via terminal:
                      </p>
                    </div>
                  )}

                  {/* Custom Model Input */}
                  <div className="mt-4">
                    <Input
                      label="manual_override"
                      value={customModel}
                      onChange={handleCustomModelChange}
                      placeholder="e.g., mistral, llama3.2, phi3"
                    />
                    <p className="text-sm text-light mt-1">
                      warning: json_mode compatibility required.
                    </p>
                  </div>

                  {/* Selected Model Display */}
                  {selectedModel && (
                    <div className={`selected-model mt-4 ${isModelInstalled ? '' : 'not-installed'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">target:</span>
                        <span className="font-bold">{selectedModel}</span>
                        {isModelInstalled ? (
                          <span className="text-success text-sm">[installed]</span>
                        ) : (
                          <span className="text-error text-sm">[missing]</span>
                        )}
                      </div>
                      {!isModelInstalled && (
                        <div className="model-install-prompt mt-3">
                          <p className="text-sm mb-2">execute command:</p>
                          <button
                            className="install-command"
                            onClick={() => copyCommand(`ollama pull ${selectedModel}`)}
                          >
                            <code>ollama pull {selectedModel}</code>
                            <span className="copy-hint">copy_to_clipboard</span>
                          </button>
                          <p className="text-sm text-light mt-2">
                            after download complete, refresh signal.
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
                  <p className="font-bold mb-2">initialization_sequence:</p>
                  <ol className="text-sm">
                    <li>
                      <span className="step-label">install binary:</span>
                      <code>curl -fsSL https://ollama.com/install.sh | sh</code>
                    </li>
                    <li>
                      <span className="step-label">retrieve model:</span>
                      <code>ollama pull mistral</code>
                    </li>
                    <li>
                      <span className="step-label">start daemon:</span>
                      <code>ollama serve</code>
                    </li>
                  </ol>
                </div>
              )}

              {/* No Models - Suggestion for text extraction */}
              {ollamaStatus?.running && ollamaStatus.availableModels?.length === 0 && (
                <div className="setup-instructions mt-4">
                  <p className="font-bold mb-2">recommended_models:</p>
                  <p className="text-sm text-light mb-3">click to copy command:</p>
                  <div className="model-suggestions">
                    <button className="suggestion" onClick={() => copyCommand('ollama pull mistral')}>
                      <code>ollama pull mistral</code>
                      <span className="text-sm text-light">optimized for logic (4.1gb)</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull llama3.2')}>
                      <code>ollama pull llama3.2</code>
                      <span className="text-sm text-light">lightweight agent (2.0gb)</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull phi3')}>
                      <code>ollama pull phi3</code>
                      <span className="text-sm text-light">minimal footprint (2.2gb)</span>
                    </button>
                    <button className="suggestion" onClick={() => copyCommand('ollama pull qwen2.5')}>
                      <code>ollama pull qwen2.5</code>
                      <span className="text-sm text-light">structured output (4.7gb)</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Gemini Option */}
        <div className="provider-group">
          <Card
            padding="md"
            className={`provider-card ${provider === 'gemini' ? 'selected' : ''}`}
            onClick={() => setProvider(provider === 'gemini' ? null : 'gemini')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">gemini_protocol</h4>
                <p className="text-sm text-light mt-1">
                  corporate surveillance. efficient. weaponize google's intelligence against them.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="provider-badges">
                  {settings?.geminiApiKey && <span className="provider-badge configured">active</span>}
                  <span className="provider-badge">cloud</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chevron-icon"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </Card>

          {/* Gemini Configuration */}
          {provider === 'gemini' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">credentials_required</h4>
              <Input
                label="access_token"
                type="password"
                value={geminiKey}
                onChange={setGeminiKey}
                placeholder="paste key sequence..."
              />
              <p className="text-sm text-light mt-2">
                retrieve key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  google_mainframe
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
            onClick={() => setProvider(provider === 'openai' ? null : 'openai')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">openai_link</h4>
                <p className="text-sm text-light mt-1">
                  closed source. expensive. maximum firepower to defeat the filters.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="provider-badges">
                  {settings?.openaiApiKey && <span className="provider-badge configured">active</span>}
                  <span className="provider-badge">cloud</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chevron-icon"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </Card>

          {/* OpenAI Configuration */}
          {provider === 'openai' && (
            <Card padding="md" className="provider-config">
              <h4 className="font-bold mb-4">authorization_needed</h4>
              <Input
                label="api_key"
                type="password"
                value={openaiKey}
                onChange={setOpenaiKey}
                placeholder="sk-..."
              />
              <p className="text-sm text-light mt-2">
                generate token at{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  openai_dashboard
                </a>
                {' '}(credits required)
              </p>
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
            {testStatus === 'testing' ? 'pinging...' : 'test_connection'}
          </Button>

          {testStatus === 'success' && (
            <span className="text-success font-bold font-mono">{testMessage || 'uplink_established'}</span>
          )}
          {testStatus === 'error' && (
            <span className="text-error font-mono">{testMessage || 'uplink_failed'}</span>
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
          {onResetApp ? 'commit_changes' : 'init_sequence'}
        </Button>
      </div>

      {/* Data Storage Section - Only show when onResetApp is provided (in settings page) */}
      {onResetApp && (
        <div className="storage-section">
          <h3 className="text-lg font-bold mb-4 font-mono">local_storage</h3>
          <Card padding="md">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium mb-2">encryption_status</p>
                <p className="text-sm text-light mt-1">
                  data resides on local disk. air-gapped from cloud storage. no external access.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-sm text-light mb-4">
                compromised system? need a fresh start?
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(true)}
              >
                system_purge
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="confirm_deletion"
        size="sm"
      >
        <div className="reset-confirm-content">
          <p className="mb-4 text-error font-bold">
            WARNING: Irreversible action.
          </p>
          <p className="mb-4">
            Wiping sector 0 through 9. Targets, contacts, and dossier will be permanently deleted.
          </p>
          <p className="text-sm text-light mb-6 font-mono">
            {'>'} sudo rm -rf /root/gaptrack/*
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
            >
              abort
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowResetConfirm(false)
                onResetApp()
              }}
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              execute_purge
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
