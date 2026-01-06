/**
 * AI Service - Unified Interface
 *
 * This provides a single interface to AI regardless of which provider is used.
 * Components don't need to know if we're using Gemini, OpenAI, or Ollama.
 *
 * Usage:
 *   const ai = createAIService(settings)
 *   const result = await ai.parseResume(resumeText)
 */

import { callGemini, testGeminiKey } from './gemini'
import { callOpenAI, testOpenAIKey } from './openai'
import { callOllama, checkOllamaStatus, testOllama } from './ollama'
import {
  getResumeParsePrompt,
  getJDParsePrompt,
  getGapAnalysisPrompt,
  getTailoredSummaryPrompt,
  getResumeAnalysisPrompt,
  getChatPrompt
} from './prompts'

/**
 * Create an AI service instance based on user's settings.
 *
 * @param {Object} settings - { aiProvider: 'gemini'|'openai'|'ollama', geminiApiKey, openaiApiKey, ollamaModel }
 */
export function createAIService(settings) {
  const { aiProvider, geminiApiKey, openaiApiKey, ollamaModel = 'mistral' } = settings

  /**
   * Call the AI with a prompt (internal use)
   */
  async function call(prompt, signal) {
    if (aiProvider === 'gemini') {
      if (!geminiApiKey) {
        return { success: false, error: 'Gemini API key not configured' }
      }
      return callGemini(geminiApiKey, prompt, signal)
    } else if (aiProvider === 'openai') {
      if (!openaiApiKey) {
        return { success: false, error: 'OpenAI API key not configured' }
      }
      return callOpenAI(openaiApiKey, prompt, signal)
    } else if (aiProvider === 'ollama') {
      return callOllama(ollamaModel, prompt, signal)
    } else {
      return { success: false, error: 'No AI provider configured' }
    }
  }

  /**
   * Parse JSON from AI response (handles various formats)
   */
  /**
   * Parse JSON from AI response (handles various formats)
   */
  function parseJSON(text) {
    if (!text) return null

    let cleaned = text.trim()

    // 1. Try direct parse
    try {
      return JSON.parse(cleaned)
    } catch (e) {
      // Continue to other methods
    }

    // 2. Extract from markdown code blocks
    // Match content between ```json and ```, or ``` and ```
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1])
      } catch (e) {
        // If code block extraction worked but parsing failed, 
        // update 'cleaned' to use the inner content for the next step (brace matching)
        cleaned = codeBlockMatch[1].trim()
      }
    }

    // 3. Extract purely based on braces (find first { and last })
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start !== -1 && end !== -1 && end > start) {
      const jsonCandidate = cleaned.substring(start, end + 1)
      try {
        return JSON.parse(jsonCandidate)
      } catch (e) {
        console.error('Failed to parse extracted JSON candidate:', e)
      }
    }

    console.error('Could not parse AI response as JSON. Raw text:', text.substring(0, 500))
    return null
  }

  return {
    /**
     * Parse a resume and extract structured data
     */
    async parseResume(resumeText, signal) {
      const prompt = getResumeParsePrompt(resumeText)
      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      const parsed = parseJSON(result.text)
      if (!parsed) {
        return { success: false, error: 'Failed to parse AI response as JSON' }
      }

      return { success: true, data: parsed }
    },

    /**
     * Parse a job description and extract requirements
     */
    async parseJobDescription(jobDescription, signal) {
      const prompt = getJDParsePrompt(jobDescription)
      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      const parsed = parseJSON(result.text)
      if (!parsed) {
        return { success: false, error: 'Failed to parse AI response as JSON' }
      }

      return { success: true, data: parsed }
    },

    /**
     * Analyze gaps between resume and job description
     */
    async analyzeGap(parsedResume, parsedJD, signal) {
      // Debug: Log what we're sending to the AI
      console.log('=== GAP ANALYSIS INPUT ===')
      console.log('Resume skills:', parsedResume?.skills)
      console.log('Resume experience count:', parsedResume?.experience?.length || 0)
      console.log('JD must-haves:', parsedJD?.requirements?.mustHave)
      console.log('JD role:', parsedJD?.role, '@ company:', parsedJD?.company)
      console.log('==========================')

      const prompt = getGapAnalysisPrompt(parsedResume, parsedJD)
      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      const parsed = parseJSON(result.text)
      if (!parsed) {
        return { success: false, error: 'Failed to parse AI response as JSON' }
      }

      // Debug: Log the match score returned by AI
      console.log('=== GAP ANALYSIS RESULT ===')
      console.log('Match Score:', parsed.matchScore)
      console.log('Summary:', parsed.summary)
      console.log('Full result:', JSON.stringify(parsed, null, 2))
      console.log('===========================')

      return { success: true, data: parsed }
    },

    /**
     * Generate a tailored summary for a specific job
     */
    async generateTailoredSummary(parsedResume, parsedJD, signal) {
      const prompt = getTailoredSummaryPrompt(parsedResume, parsedJD)
      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      return { success: true, text: result.text.trim() }
    },

    /**
     * Analyze a resume and provide feedback (normal or roast mode)
     */
    async analyzeResume(parsedResume, mode = 'normal', signal) {
      const prompt = getResumeAnalysisPrompt(parsedResume, mode)
      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      const parsed = parseJSON(result.text)
      if (!parsed) {
        return { success: false, error: 'Failed to parse AI response as JSON' }
      }

      // Add the mode to the result
      return { success: true, data: { ...parsed, mode } }
    },

    /**
     * Chat with the AI
     */
    async chat(messageHistory, resumeContext, mode = 'normal', signal) {
      const prompt = getChatPrompt(messageHistory, resumeContext, mode)

      // Debug: Log the jobs being sent
      const jobCount = resumeContext?.jobs?.length || 0
      const jobNames = (resumeContext?.jobs || []).map(j => j.company).join(', ')
      console.log(`--- CHAT: Sending ${jobCount} jobs: [${jobNames}] ---`)

      const result = await call(prompt, signal)

      if (!result.success) {
        return result
      }

      let text = result.text.trim()
      console.log('--- RAW AI RESPONSE ---')
      console.log(text)
      console.log('-----------------------')

      // Fallback: If AI returns JSON-like format despite instructions, clean it up
      if (text.startsWith('{') || text.startsWith('```')) {
        // Try to parse as JSON first
        const parsed = parseJSON(text)
        if (parsed) {
          // 1. Try standard response keys
          let content = parsed.response || parsed.message || parsed.assistant || parsed.text || parsed.content || parsed.reply || parsed.answer

          // 2. If not found, look for a LONG string value (avoid short values like company names)
          if (!content) {
            const values = Object.values(parsed)
            const longStrings = values
              .filter(v => typeof v === 'string' && v.length > 20)
              .sort((a, b) => b.length - a.length)
            if (longStrings.length > 0) {
              content = longStrings[0]
            }
          }

          if (content) {
            text = content
          }
        } else {
          // JSON parsing failed - it might be malformed JSON-like text
          // Try to extract content after the first colon and strip quotes
          // e.g., {"Analysis of Lyzr": "### Match Score..." -> ### Match Score...
          const colonIdx = text.indexOf(':')
          if (colonIdx > 0 && colonIdx < 50) {
            let extracted = text.substring(colonIdx + 1).trim()
            // Remove leading/trailing quotes and braces
            extracted = extracted.replace(/^["'\s{]+/, '').replace(/["'\s}]+$/, '')
            if (extracted.length > 20) {
              text = extracted
            }
          }
        }
      }

      // Clean up any remaining markdown code block markers
      text = text.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim()

      return { success: true, text }
    },

    /**
     * Raw call - send any prompt
     */
    async rawCall(prompt, signal) {
      return call(prompt, signal)
    }
  }
}

/**
 * Test if the AI provider is configured correctly
 */
export async function testAIProvider(settings) {
  const { aiProvider, geminiApiKey, openaiApiKey, ollamaModel = 'mistral' } = settings

  if (aiProvider === 'gemini') {
    if (!geminiApiKey) {
      return { success: false, error: 'No API key provided' }
    }
    return testGeminiKey(geminiApiKey)
  } else if (aiProvider === 'openai') {
    if (!openaiApiKey) {
      return { success: false, error: 'No API key provided' }
    }
    return testOpenAIKey(openaiApiKey)
  } else if (aiProvider === 'ollama') {
    return testOllama(ollamaModel)
  }

  return { success: false, error: 'No AI provider selected' }
}

// Re-export for direct access if needed
export { checkOllamaStatus } from './ollama'
export { testGeminiKey } from './gemini'
export { testOpenAIKey } from './openai'
