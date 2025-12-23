/**
 * OpenAI API Service
 *
 * Calls OpenAI's API directly from the browser.
 * User provides their own API key (stored locally, never sent to our servers).
 *
 * HOW TO GET AN OPENAI API KEY:
 * 1. Go to https://platform.openai.com/api-keys
 * 2. Click "Create new secret key"
 * 3. Copy the key
 *
 * PRICING:
 * - GPT-4o: $2.50/1M input tokens, $10/1M output tokens
 * - GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
 * - Pay-as-you-go, no free tier for API
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Send a prompt to OpenAI and get a response.
 *
 * @param {string} apiKey - User's OpenAI API key
 * @param {string} prompt - The prompt to send
 * @param {string} model - Model to use (default: gpt-4o-mini)
 * @returns {Object} { success: boolean, text?: string, error?: string }
 */
export async function callOpenAI(apiKey, prompt, signal, model = 'gpt-4o-mini') {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      }),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || `API error: ${response.status}`

      if (response.status === 401) {
        return { success: false, error: 'Invalid API key. Get one from platform.openai.com' }
      }
      if (response.status === 429) {
        return { success: false, error: 'Rate limit or quota exceeded. Check your OpenAI billing.' }
      }
      if (response.status === 503) {
        return { success: false, error: 'OpenAI service temporarily unavailable. Try again.' }
      }

      return { success: false, error: errorMsg }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      return { success: false, error: 'No response from OpenAI' }
    }

    return { success: true, text }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Send a prompt with an image to OpenAI Vision
 *
 * @param {string} apiKey - User's OpenAI API key
 * @param {string} prompt - The prompt to send
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} model - Model to use (default: gpt-4o)
 * @returns {Object} { success: boolean, text?: string, error?: string }
 */
export async function callOpenAIVision(apiKey, prompt, imageBase64, model = 'gpt-4o') {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData.error?.message || `API error: ${response.status}` }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      return { success: false, error: 'No response from OpenAI' }
    }

    return { success: true, text }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Test if the API key is valid
 */
export async function testOpenAIKey(apiKey) {
  if (!apiKey || apiKey.trim().length < 20) {
    return { success: false, error: 'Invalid API key format' }
  }

  const result = await callOpenAI(apiKey.trim(), 'Respond with only the word "OK"')
  return result
}
