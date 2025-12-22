/**
 * IndexedDB Storage Utilities
 *
 * Used to persist FileSystemDirectoryHandle across page refreshes.
 * IndexedDB can store complex objects like file handles, unlike localStorage.
 *
 * 100% local - no cloud, no servers.
 */

const DB_NAME = 'gaptrack-storage'
const DB_VERSION = 1
const HANDLES_STORE = 'handles'
const DIR_HANDLE_KEY = 'gaptrack-dir'

/**
 * Open the IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('IndexedDB error:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object store for file handles
      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE)
      }
    }
  })
}

/**
 * Store the directory handle in IndexedDB
 * @param {FileSystemDirectoryHandle} handle - The directory handle to store
 */
export async function storeDirectoryHandle(handle) {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLES_STORE, 'readwrite')
      const store = transaction.objectStore(HANDLES_STORE)
      const request = store.put(handle, DIR_HANDLE_KEY)

      request.onsuccess = () => {
        console.log('Directory handle stored in IndexedDB')
        resolve(true)
      }

      request.onerror = () => {
        console.error('Failed to store handle:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch (error) {
    console.error('IndexedDB store error:', error)
    return false
  }
}

/**
 * Retrieve the stored directory handle from IndexedDB
 * @returns {FileSystemDirectoryHandle|null} The stored handle or null
 */
export async function getStoredDirectoryHandle() {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLES_STORE, 'readonly')
      const store = transaction.objectStore(HANDLES_STORE)
      const request = store.get(DIR_HANDLE_KEY)

      request.onsuccess = () => {
        const handle = request.result
        if (handle) {
          console.log('Directory handle retrieved from IndexedDB')
        }
        resolve(handle || null)
      }

      request.onerror = () => {
        console.error('Failed to retrieve handle:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch (error) {
    console.error('IndexedDB retrieve error:', error)
    return null
  }
}

/**
 * Remove the stored directory handle from IndexedDB
 */
export async function removeDirectoryHandle() {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLES_STORE, 'readwrite')
      const store = transaction.objectStore(HANDLES_STORE)
      const request = store.delete(DIR_HANDLE_KEY)

      request.onsuccess = () => {
        console.log('Directory handle removed from IndexedDB')
        resolve(true)
      }

      request.onerror = () => {
        console.error('Failed to remove handle:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch (error) {
    console.error('IndexedDB remove error:', error)
    return false
  }
}

/**
 * Verify that a stored handle still has permission
 * @param {FileSystemDirectoryHandle} handle - The handle to verify
 * @returns {boolean} True if permission is granted
 */
export async function verifyHandlePermission(handle) {
  try {
    // Check current permission status
    const permission = await handle.queryPermission({ mode: 'readwrite' })

    if (permission === 'granted') {
      return true
    }

    // Try to request permission (will prompt user if needed)
    const requestResult = await handle.requestPermission({ mode: 'readwrite' })
    return requestResult === 'granted'
  } catch (error) {
    console.error('Permission verification error:', error)
    return false
  }
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported() {
  return typeof indexedDB !== 'undefined'
}
