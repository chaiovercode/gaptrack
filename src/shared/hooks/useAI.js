/**
 * useAI Hook
 *
 * A React hook that provides AI functionality to components.
 * Automatically uses the right provider based on user's settings.
 *
 * Usage in components:
 *   const { parseResume, analyzeGap, isProcessing } = useAI()
 *   const result = await parseResume(resumeText)
 */

import { useState, useCallback, useMemo } from 'react'
import { createAIService, testAIProvider, checkOllamaStatus } from '../../services/ai'

export function useAI(settings) {
  // Track processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Create AI service instance when settings change
  const ai = useMemo(() => {
    if (!settings?.aiProvider) return null
    return createAIService(settings)
  }, [settings?.aiProvider, settings?.geminiApiKey, settings?.openaiApiKey, settings?.ollamaModel])

  /**
   * Wrapper to handle loading state and errors
   */
  const withProcessing = useCallback((fn) => async (...args) => {
    if (!ai) {
      return { success: false, error: 'AI not configured' }
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await fn(...args)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (err) {
      const errorMsg = err.message || 'AI processing failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsProcessing(false)
    }
  }, [ai])

  /**
   * Parse resume text and extract structured data
   */
  const parseResume = useCallback(
    withProcessing(async (resumeText) => {
      return ai.parseResume(resumeText)
    }),
    [ai, withProcessing]
  )

  /**
   * Parse job description and extract requirements
   */
  const parseJobDescription = useCallback(
    withProcessing(async (jobDescription) => {
      return ai.parseJobDescription(jobDescription)
    }),
    [ai, withProcessing]
  )

  /**
   * Analyze gaps between resume and job description
   */
  const analyzeGap = useCallback(
    withProcessing(async (parsedResume, parsedJD) => {
      return ai.analyzeGap(parsedResume, parsedJD)
    }),
    [ai, withProcessing]
  )

  /**
   * Generate tailored summary for a job
   */
  const generateTailoredSummary = useCallback(
    withProcessing(async (parsedResume, parsedJD) => {
      return ai.generateTailoredSummary(parsedResume, parsedJD)
    }),
    [ai, withProcessing]
  )

  /**
   * Analyze resume with feedback (normal or roast mode)
   */
  const analyzeResume = useCallback(
    withProcessing(async (parsedResume, mode = 'normal') => {
      return ai.analyzeResume(parsedResume, mode)
    }),
    [ai, withProcessing]
  )

  /**
   * Test if AI is configured correctly
   */
  const testConnection = useCallback(async () => {
    if (!settings?.aiProvider) {
      return { success: false, error: 'No AI provider selected' }
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await testAIProvider(settings)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } finally {
      setIsProcessing(false)
    }
  }, [settings])

  /**
   * Check Ollama status (is it running? which models?)
   */
  const checkOllama = useCallback(async (model) => {
    return checkOllamaStatus(model || settings?.ollamaModel || 'llava')
  }, [settings?.ollamaModel])

  return {
    // State
    isConfigured: !!ai,
    isProcessing,
    error,
    clearError: () => setError(null),

    // AI Functions
    parseResume,
    parseJobDescription,
    analyzeGap,
    generateTailoredSummary,
    analyzeResume,

    // Setup/Testing
    testConnection,
    checkOllama
  }
}
