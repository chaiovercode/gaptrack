/**
 * AISettings Component
 *
 * Lets users choose their AI provider and configure it.
 * Options:
 * 1. Gemini - Need API key (free tier available)
 * 2. OpenAI - Need API key (paid)
 * 3. Ollama - Need Ollama running locally (100% free, vision models only)
 */

import { useState, useEffect } from 'react'
import { Button, Card, Input } from '../../../shared/components'
import { useAI } from '../../../shared/hooks'
import { checkOllamaStatus } from '../../../services/ai'
import './AISettings.css'

// Vision-capable Ollama models that can parse PDFs/images
const VISION_MODELS = [
  'llava',
  'llama3.2-vision:11b',
  'llama4',
  'granite3.2-vision',
  'moondream',
  'qwen2.5-vl'
]

function AISettings({ settings, onSave }) {
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

  const handleSave = () => {
    const selectedModel = ollamaModel || customModel
    onSave({
      aiProvider: provider,
      geminiApiKey: provider === 'gemini' ? geminiKey : null,
      openaiApiKey: provider === 'openai' ? openaiKey : null,
      ollamaModel: provider === 'ollama' ? selectedModel : 'llava'
    })
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

  const canSave = provider && (
    (provider === 'gemini' && geminiKey) ||
    (provider === 'openai' && openaiKey) ||
    (provider === 'ollama' && ollamaStatus?.running && selectedModel)
  )

  return (
    <div className="ai-settings">
      <h3 className="text-xl font-bold mb-4">Choose AI Provider</h3>

      {/* Provider Selection */}
      <div className="provider-options">
        {/* Gemini Option */}
        <Card
          padding="md"
          className={`provider-card ${provider === 'gemini' ? 'selected' : ''}`}
          onClick={() => setProvider('gemini')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">Gemini (Google)</h4>
              <p className="text-sm text-light mt-1">
                Fast, cloud-based. Free tier: 15 req/min
              </p>
            </div>
            <span className="provider-badge">Cloud</span>
          </div>
        </Card>

        {/* OpenAI Option */}
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

        {/* Ollama Option */}
        <Card
          padding="md"
          className={`provider-card ${provider === 'ollama' ? 'selected' : ''}`}
          onClick={() => setProvider('ollama')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">Ollama (Local)</h4>
              <p className="text-sm text-light mt-1">
                100% private. Vision models for PDF parsing.
              </p>
            </div>
            <span className="provider-badge local">Local</span>
          </div>
        </Card>
      </div>

      {/* Gemini Configuration */}
      {provider === 'gemini' && (
        <Card padding="md" className="mt-4">
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

      {/* OpenAI Configuration */}
      {provider === 'openai' && (
        <Card padding="md" className="mt-4">
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

      {/* Ollama Configuration */}
      {provider === 'ollama' && (
        <Card padding="md" className="mt-4">
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
                  label="Or enter vision model name manually"
                  value={customModel}
                  onChange={handleCustomModelChange}
                  placeholder="e.g., llava, moondream, qwen2.5-vl"
                />
                <p className="text-sm text-light mt-1">
                  Use vision-capable models for PDF parsing
                </p>
              </div>

              {/* Selected Model Display */}
              {selectedModel && (
                <div className="selected-model mt-4">
                  <span className="text-sm">Selected:</span>
                  <span className="font-bold ml-2">{selectedModel}</span>
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

          {/* No Models - Suggestion (Vision models only for PDF parsing) */}
          {ollamaStatus?.running && ollamaStatus.availableModels?.length === 0 && (
            <div className="setup-instructions mt-4">
              <p className="font-bold mb-2">Recommended Vision Models (for PDF parsing):</p>
              <div className="model-suggestions">
                <div className="suggestion">
                  <code>ollama pull llava</code>
                  <span className="text-sm text-light">Best for images/PDFs (4.7GB)</span>
                </div>
                <div className="suggestion">
                  <code>ollama pull llama3.2-vision:11b</code>
                  <span className="text-sm text-light">Meta's vision model (7.9GB)</span>
                </div>
                <div className="suggestion">
                  <code>ollama pull moondream</code>
                  <span className="text-sm text-light">Lightweight vision (1.7GB)</span>
                </div>
                <div className="suggestion">
                  <code>ollama pull qwen2.5-vl</code>
                  <span className="text-sm text-light">Alibaba vision model (4.4GB)</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

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
          Save & Continue
        </Button>
      </div>
    </div>
  )
}

export default AISettings
