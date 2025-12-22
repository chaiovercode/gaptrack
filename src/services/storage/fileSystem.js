/**
 * File System API Storage Service - Folder Based
 *
 * Uses a folder with multiple JSON files for better organization:
 * - jobs.json      → Job applications
 * - contacts.json  → Contact list
 * - resume.json    → Resume data
 * - settings.json  → App settings
 *
 * HOW IT WORKS:
 * 1. User clicks "Choose folder" → browser opens folder picker
 * 2. User picks/creates a folder (e.g., ~/Documents/GapTrack/)
 * 3. We get a "directory handle" - a reference to that folder
 * 4. We can now read/write individual JSON files in that folder
 */

// File names for each data type
const FILES = {
  jobs: 'jobs.json',
  contacts: 'contacts.json',
  resume: 'resume.json',
  settings: 'settings.json'
}

// Check if File System API is supported
export const isFileSystemSupported = () => {
  return 'showDirectoryPicker' in window
}

/**
 * Opens a folder picker and lets user choose where to save data.
 * Returns a "directory handle" we can use to read/write files.
 */
export const pickFolder = async () => {
  try {
    const handle = await window.showDirectoryPicker({
      id: 'gaptrack-data',
      mode: 'readwrite',
      startIn: 'documents'
    })
    return { success: true, handle }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, cancelled: true }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Get or create a file in the directory
 */
const getFileHandle = async (dirHandle, fileName, create = true) => {
  try {
    return await dirHandle.getFileHandle(fileName, { create })
  } catch (error) {
    if (error.name === 'NotFoundError' && !create) {
      return null
    }
    throw error
  }
}

/**
 * Write data to a specific file in the folder
 */
export const writeFile = async (dirHandle, fileName, data) => {
  try {
    const fileHandle = await getFileHandle(dirHandle, fileName, true)
    const writable = await fileHandle.createWritable()
    const jsonString = JSON.stringify(data, null, 2)
    await writable.write(jsonString)
    await writable.close()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Read data from a specific file in the folder
 */
export const readFile = async (dirHandle, fileName) => {
  try {
    const fileHandle = await getFileHandle(dirHandle, fileName, false)
    if (!fileHandle) {
      return { success: true, data: null }
    }
    const file = await fileHandle.getFile()
    const text = await file.text()
    if (!text.trim()) {
      return { success: true, data: null }
    }
    const data = JSON.parse(text)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Read all data files from the folder
 */
export const readAllData = async (dirHandle) => {
  const results = {}

  for (const [key, fileName] of Object.entries(FILES)) {
    const result = await readFile(dirHandle, fileName)
    if (result.success) {
      results[key] = result.data
    } else {
      results[key] = null
    }
  }

  return { success: true, data: results }
}

/**
 * Initialize folder with default files if they don't exist
 */
export const initializeFolder = async (dirHandle) => {
  const defaults = getDefaultData()

  for (const [key, fileName] of Object.entries(FILES)) {
    const existing = await readFile(dirHandle, fileName)
    if (!existing.data) {
      await writeFile(dirHandle, fileName, defaults[key])
    }
  }

  return { success: true }
}

/**
 * Save a specific data type to its file
 */
export const saveDataType = async (dirHandle, dataType, data) => {
  const fileName = FILES[dataType]
  if (!fileName) {
    return { success: false, error: `Unknown data type: ${dataType}` }
  }
  return writeFile(dirHandle, fileName, {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Default data structure for each file
 */
export const getDefaultData = () => ({
  jobs: {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  contacts: {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  resume: {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileName: null,
    content: null,
    parsedData: null,
    uploadedAt: null
  },
  settings: {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiProvider: null,
    geminiApiKey: null,
    ollamaModel: 'mistral',
    viewPreference: 'list'
  }
})

// Legacy exports for backwards compatibility
export const pickSaveLocation = pickFolder
export const pickOpenLocation = pickFolder
