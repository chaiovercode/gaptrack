import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import { StorageProvider } from './context/StorageContext'
import { AIProvider } from './context/AIContext'

// This is where React starts
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StorageProvider>
      <AIProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AIProvider>
    </StorageProvider>
  </StrictMode>,
)
