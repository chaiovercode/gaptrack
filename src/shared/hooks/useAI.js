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

import { useState, useCallback, useMemo, useRef } from 'react'
import { createAIService, testAIProvider, checkOllamaStatus } from '../../services/ai'

export function useAI(settings) {
  // Track processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Abort controller for cancelling requests
  const abortControllerRef = useRef(null)

  // Create AI service instance when settings change
  const ai = useMemo(() => {
    if (!settings?.aiProvider) return null
    return createAIService(settings)
  }, [settings?.aiProvider, settings?.geminiApiKey, settings?.openaiApiKey, settings?.ollamaModel])

  /**
   * Cancel ongoing AI operation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsProcessing(false)
  }, [])

  /**
   * Wrapper to handle loading state and errors
   */
  const withProcessing = useCallback((fn) => async (...args) => {
    if (!ai) {
      return { success: false, error: 'AI not configured' }
    }

    // Abort previous request if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsProcessing(true)
    setError(null)

    try {
      // Pass signal as the last argument
      const result = await fn(...args, controller.signal)
      if (!result.success) {
        // Don't set error if cancelled
        if (result.error !== 'Cancelled' && !controller.signal.aborted) {
          setError(result.error)
        }
      }
      return result
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return { success: false, error: 'Cancelled' }
      }

      const errorMsg = err.message || 'AI processing failed'
      if (!controller.signal.aborted) {
        setError(errorMsg)
      }
      return { success: false, error: errorMsg }
    } finally {
      // Only clear processing if this was the active controller
      if (abortControllerRef.current === controller) {
        setIsProcessing(false)
        abortControllerRef.current = null
      }
    }
  }, [ai])

  /**
   * Parse resume text and extract structured data
   */
  const parseResume = useCallback(
    withProcessing(async (resumeText, signal) => {
      return ai.parseResume(resumeText, signal)
    }),
    [ai, withProcessing]
  )

  /**
   * Parse job description and extract requirements
   */
  const parseJobDescription = useCallback(
    withProcessing(async (jobDescription, signal) => {
      // Note: ai.parseJobDescription needs to support signal
      if (ai.parseJobDescription.length > 1 || true) {
        return ai.parseJobDescription(jobDescription, signal)
      }
      return ai.parseJobDescription(jobDescription)
    }),
    [ai, withProcessing]
  )

  /**
   * Analyze gaps between resume and job description
   */
  const analyzeGap = useCallback(
    withProcessing(async (parsedResume, parsedJD, signal) => {
      return ai.analyzeGap(parsedResume, parsedJD, signal)
    }),
    [ai, withProcessing]
  )

  /**
   * Generate tailored summary for a job
   */
  const generateTailoredSummary = useCallback(
    withProcessing(async (parsedResume, parsedJD, signal) => {
      return ai.generateTailoredSummary(parsedResume, parsedJD, signal)
    }),
    [ai, withProcessing]
  )

  /**
   * Analyze resume with feedback (normal or roast mode)
   */
  const analyzeResume = useCallback(
    withProcessing(async (parsedResume, mode = 'normal', signal) => {
      // Handle case where signal is passed as 2nd arg if mode is omitted/defaulted in call? 
      // check arguments length in withProcessing? 
      // Actually `withProcessing` spreads args.
      // If `analyzeResume` is called as `analyzeResume(res, 'roast')`, args=['res', 'roast'].
      // `fn` receives (res, 'roast', signal).
      // If called as `analyzeResume(res)`, args=['res']. `fn` receives (res, signal).
      // But here `mode='normal'` is default.
      // Wait, `fn` definition here has `mode='normal'`. 
      // If `signal` is passed as 2nd argument effectively?
      // When `fn` is defined as `(a, b=default, c)`, calling it with `(a, c)` -> `b` takes `c`!
      // This is dangerous.
      // Better to check type of last arg?
      // Actually `withProcessing` passes `(...args, signal)`. 
      // So if I call `analyzeResume(r)`, args=[r]. fn called with `(r, signal)`. 
      // `mode` takes `signal`. `signal` becomes undefined.

      // Fix: Let's assume standard usage ensures correct args, OR simpler:
      // Just check if `mode` is AbortSignal? No.
      // We should define wrapper correctly.

      // If called with 1 arg: args=[p]. fn(p, signal). mode=signal.
      // We need to handle this manually.
      if (mode instanceof AbortSignal) {
        signal = mode
        mode = 'normal'
      }
      return ai.analyzeResume(parsedResume, mode, signal)
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
    return checkOllamaStatus(model || settings?.ollamaModel || 'mistral')
  }, [settings?.ollamaModel])

  return {
    // State
    isConfigured: !!ai,
    isProcessing,
    error,
    clearError: () => setError(null),
    cancel,

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
