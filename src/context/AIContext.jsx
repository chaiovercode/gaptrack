import { createContext, useContext } from 'react'
import { useAI } from '../shared/hooks/useAI'
import { useStorageContext } from './StorageContext'

const AIContext = createContext(null)

export function AIProvider({ children }) {
    // AI depends on settings from storage
    const { data } = useStorageContext()
    const settings = data?.settings

    const ai = useAI(settings)

    return (
        <AIContext.Provider value={ai}>
            {children}
        </AIContext.Provider>
    )
}

export function useAIContext() {
    const context = useContext(AIContext)
    if (!context) {
        throw new Error('useAIContext must be used within an AIProvider')
    }
    return context
}
