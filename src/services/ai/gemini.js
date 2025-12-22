/**
 * Gemini API Service
 *
 * Calls Google's Gemini API directly from the browser.
 * User provides their own API key (stored locally, never sent to our servers).
 *
 * HOW TO GET A GEMINI API KEY:
 * 1. Go to https://aistudio.google.com/app/apikey
 * 2. Click "Create API Key"
 * 3. Copy the key
 *
 * FREE TIER LIMITS:
 * - 15 requests per minute
 * - 1 million tokens per day
 * - More than enough for job tracking!
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * Send a prompt to Gemini and get a response.
 *
 * @param {string} apiKey - User's Gemini API key
 * @param {string} prompt - The prompt to send
 * @returns {Object} { success: boolean, text?: string, error?: string }
 */
export async function callGemini(apiKey, prompt) {
  try {
    console.log('Calling Gemini API...')
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || `API error: ${response.status}`

      // Provide helpful error messages
      if (response.status === 400) {
        return { success: false, error: 'Invalid API key. Get one from aistudio.google.com' }
      }
      if (response.status === 403) {
        return { success: false, error: 'API key not authorized. Check your key at aistudio.google.com' }
      }
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Wait a moment and try again.' }
      }

      return { success: false, error: errorMsg }
    }

    const data = await response.json()
    console.log('Gemini response:', data)

    // Extract text from Gemini's response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('No text in Gemini response:', data)
      return { success: false, error: 'No response from Gemini' }
    }

    console.log('Gemini returned text, length:', text.length)
    return { success: true, text }
  } catch (error) {
    console.error('Gemini error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Test if the API key is valid
 */
export async function testGeminiKey(apiKey) {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, error: 'Invalid API key format' }
  }

  const result = await callGemini(apiKey.trim(), 'Respond with only the word "OK"')
  return result
}
