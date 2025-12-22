/**
 * useStorage Hook - Folder Based
 *
 * Manages data storage using a folder with multiple JSON files:
 * - jobs.json      → Job applications
 * - contacts.json  → Contact list
 * - resume.json    → Resume data
 * - settings.json  → App settings
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  isFileSystemSupported,
  pickFolder,
  readAllData,
  initializeFolder,
  saveDataType,
  getDefaultData
} from '../../services/storage/fileSystem'

const STORAGE_KEY = 'gaptrack-data'
const HAS_FOLDER_KEY = 'gaptrack-has-folder'

export function useStorage() {
  const [data, setData] = useState(null)
  const [dirHandle, setDirHandle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [storageType, setStorageType] = useState(null)

  // Use refs to avoid stale closures
  const dataRef = useRef(data)
  const dirHandleRef = useRef(dirHandle)
  const storageTypeRef = useRef(storageType)

  // Keep refs in sync with state
  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    dirHandleRef.current = dirHandle
  }, [dirHandle])

  useEffect(() => {
    storageTypeRef.current = storageType
  }, [storageType])

  useEffect(() => {
    initializeStorage()
  }, [])

  const initializeStorage = async () => {
    setIsLoading(true)
    setError(null)

    if (isFileSystemSupported()) {
      setStorageType('fileSystem')
      const hasFolder = localStorage.getItem(HAS_FOLDER_KEY)
      if (!hasFolder) {
        setIsLoading(false)
        return
      }
    } else {
      setStorageType('localStorage')
      loadFromLocalStorage()
    }

    setIsLoading(false)
  }

  /**
   * Set up folder storage (first time)
   */
  const setupFileStorage = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await pickFolder()

    if (result.cancelled) {
      setIsLoading(false)
      return { success: false, cancelled: true }
    }

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return { success: false, error: result.error }
    }

    setDirHandle(result.handle)

    // Initialize folder with default files
    await initializeFolder(result.handle)

    // Read all data
    const readResult = await readAllData(result.handle)

    localStorage.setItem(HAS_FOLDER_KEY, 'true')

    // Convert to flat structure for compatibility
    const flatData = convertToFlatData(readResult.data)
    setData(flatData)
    setIsLoading(false)
    return { success: true }
  }, [])

  /**
   * Open existing folder
   */
  const openExistingFile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await pickFolder()

    if (result.cancelled) {
      setIsLoading(false)
      return { success: false, cancelled: true }
    }

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return { success: false, error: result.error }
    }

    setDirHandle(result.handle)

    // Read all data from folder
    const readResult = await readAllData(result.handle)

    localStorage.setItem(HAS_FOLDER_KEY, 'true')

    const flatData = convertToFlatData(readResult.data)
    setData(flatData)
    setIsLoading(false)
    return { success: true }
  }, [])

  /**
   * Convert folder structure to flat data for app compatibility
   */
  const convertToFlatData = (folderData) => {
    const defaults = getDefaultData()
    return {
      applications: folderData?.jobs?.items || [],
      contacts: folderData?.contacts?.items || [],
      resume: folderData?.resume || defaults.resume,
      settings: folderData?.settings || defaults.settings,
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Save all data
   */
  const save = useCallback(async (newData) => {
    const dataToSave = {
      ...newData,
      updatedAt: new Date().toISOString()
    }

    if (storageType === 'fileSystem' && dirHandle) {
      // Save each file separately
      await saveDataType(dirHandle, 'jobs', {
        items: dataToSave.applications || [],
        updatedAt: dataToSave.updatedAt
      })
      await saveDataType(dirHandle, 'contacts', {
        items: dataToSave.contacts || [],
        updatedAt: dataToSave.updatedAt
      })
      await saveDataType(dirHandle, 'resume', dataToSave.resume || {})
      await saveDataType(dirHandle, 'settings', dataToSave.settings || {})
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }

    setData(dataToSave)
    return { success: true }
  }, [storageType, dirHandle])

  /**
   * Update a specific part of data and save
   */
  const updateAndSave = useCallback(async (key, value) => {
    // Use refs to get the latest values and avoid stale closures
    const currentData = dataRef.current || {}
    const currentDirHandle = dirHandleRef.current
    const currentStorageType = storageTypeRef.current

    const newData = {
      ...currentData,
      [key]: value,
      updatedAt: new Date().toISOString()
    }

    // Update state immediately for responsive UI
    setData(newData)
    dataRef.current = newData // Also update ref immediately

    // Then persist to storage
    if (currentStorageType === 'fileSystem' && currentDirHandle) {
      if (key === 'applications') {
        await saveDataType(currentDirHandle, 'jobs', {
          items: value || [],
          updatedAt: newData.updatedAt
        })
      } else if (key === 'contacts') {
        await saveDataType(currentDirHandle, 'contacts', {
          items: value || [],
          updatedAt: newData.updatedAt
        })
      } else if (key === 'resume') {
        await saveDataType(currentDirHandle, 'resume', value || {})
      } else if (key === 'settings') {
        await saveDataType(currentDirHandle, 'settings', value || {})
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    }

    return { success: true }
  }, []) // No dependencies - uses refs

  /**
   * Add a new application
   */
  const addApplication = useCallback(async (application) => {
    const newApp = {
      ...application,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const newData = {
      ...data,
      applications: [...(data?.applications || []), newApp]
    }
    return save(newData)
  }, [data, save])

  /**
   * Update an existing application
   */
  const updateApplication = useCallback(async (id, updates) => {
    const newData = {
      ...data,
      applications: (data?.applications || []).map(app =>
        app.id === id
          ? { ...app, ...updates, updatedAt: new Date().toISOString() }
          : app
      )
    }
    return save(newData)
  }, [data, save])

  /**
   * Delete an application
   */
  const deleteApplication = useCallback(async (id) => {
    const currentData = dataRef.current || {}
    const newApps = (currentData.applications || []).filter(app => app.id !== id)
    return updateAndSave('applications', newApps)
  }, [updateAndSave])

  /**
   * Delete a contact
   */
  const deleteContact = useCallback(async (id) => {
    const currentData = dataRef.current || {}
    const newContacts = (currentData.contacts || []).filter(c => c.id !== id)
    return updateAndSave('contacts', newContacts)
  }, [updateAndSave])

  /**
   * Update a contact
   */
  const updateContact = useCallback(async (contactData) => {
    const currentData = dataRef.current || {}
    const contacts = currentData.contacts || []

    if (contactData.id) {
      // Update existing
      const newContacts = contacts.map(c =>
        c.id === contactData.id
          ? { ...c, ...contactData, updatedAt: new Date().toISOString() }
          : c
      )
      return updateAndSave('contacts', newContacts)
    } else {
      // Add new
      const newContact = {
        ...contactData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return updateAndSave('contacts', [...contacts, newContact])
    }
  }, [updateAndSave])

  // LocalStorage fallback
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch {
        const defaults = getDefaultData()
        setData(convertToFlatData(defaults))
      }
    } else {
      const defaults = getDefaultData()
      setData(convertToFlatData(defaults))
    }
  }

  return {
    data,
    isLoading,
    error,
    storageType,
    needsSetup: storageType === 'fileSystem' && !dirHandle && !data,
    setupFileStorage,
    openExistingFile,
    save,
    updateAndSave,
    addApplication,
    updateApplication,
    deleteApplication,
    deleteContact,
    updateContact,
    isFileSystemSupported: isFileSystemSupported()
  }
}
