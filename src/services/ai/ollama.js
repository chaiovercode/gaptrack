/**
 * Ollama Service
 *
 * Calls Ollama running locally on user's machine.
 * 100% free, 100% private - nothing leaves the computer.
 *
 * HOW TO SET UP OLLAMA:
 * 1. Install: curl -fsSL https://ollama.com/install.sh | sh
 * 2. Pull a model: ollama pull mistral
 * 3. Run: ollama serve (runs on http://localhost:11434)
 *
 * RECOMMENDED MODELS:
 * - mistral (7B) - Best for instruction following & JSON output (Recommended)
 * - llama3.2 - Good lightweight alternative
 * - phi3 - Microsoft's small model
 * - qwen2.5 - Good for structured output
 *
 * NOTE: nuextract requires special template format, not recommended for this app
 */

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'

/**
 * Send a prompt to Ollama and get a response.
 *
 * @param {string} model - The model to use (e.g., 'mistral', 'llama2')
 * @param {string} prompt - The prompt to send
 * @returns {Object} { success: boolean, text?: string, error?: string }
 */
export async function callOllama(model, prompt) {
  try {
    // Use lower temperature for more consistent JSON output
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,  // Lower temp for consistent JSON
          num_predict: 4096,
        }
      })
    })

    if (!response.ok) {
      // Ollama not running or model not found
      if (response.status === 0 || !response.status) {
        return {
          success: false,
          error: 'Cannot connect to Ollama. Make sure it\'s running: ollama serve'
        }
      }
      return {
        success: false,
        error: `Ollama error: ${response.status}`
      }
    }

    const data = await response.json()

    if (!data.response) {
      return { success: false, error: 'No response from Ollama' }
    }

    return { success: true, text: data.response }
  } catch (error) {
    // Network error - Ollama probably not running
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        success: false,
        error: 'Cannot connect to Ollama. Make sure it\'s running: ollama serve'
      }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Check if Ollama is running and has the specified model
 */
export async function checkOllamaStatus(model = 'mistral') {
  try {
    // Check if Ollama is running
    const tagsResponse = await fetch('http://localhost:11434/api/tags')

    if (!tagsResponse.ok) {
      return { running: false, hasModel: false, error: 'Ollama not running' }
    }

    const tagsData = await tagsResponse.json()
    const models = tagsData.models || []
    const hasModel = models.some(m => m.name.startsWith(model))

    return {
      running: true,
      hasModel,
      availableModels: models.map(m => m.name),
      error: hasModel ? null : `Model "${model}" not installed. Run: ollama pull ${model}`
    }
  } catch (error) {
    return {
      running: false,
      hasModel: false,
      error: 'Cannot connect to Ollama. Make sure it\'s running: ollama serve'
    }
  }
}

/**
 * Test if Ollama is working with the specified model
 */
export async function testOllama(model = 'mistral') {
  const status = await checkOllamaStatus(model)
  if (!status.running || !status.hasModel) {
    return { success: false, ...status }
  }

  const result = await callOllama(model, 'Say "OK" if you can read this.')
  return { ...result, ...status }
}
