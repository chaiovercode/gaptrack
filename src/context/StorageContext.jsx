import { createContext, useContext, useEffect, useRef } from 'react'
import { useStorage } from '../shared/hooks/useStorage'

const StorageContext = createContext(null)

export function StorageProvider({ children }) {
    const storage = useStorage()

    return (
        <StorageContext.Provider value={storage}>
            {children}
        </StorageContext.Provider>
    )
}

export function useStorageContext() {
    const context = useContext(StorageContext)
    if (!context) {
        throw new Error('useStorageContext must be used within a StorageProvider')
    }
    return context
}
