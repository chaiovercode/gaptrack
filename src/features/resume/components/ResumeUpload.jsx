/**
 * Resume Upload Component
 *
 * Two ways to input resume:
 * 1. Upload a file (PDF, TXT, DOCX)
 * 2. Paste text directly
 *
 * After input, AI parses the resume into structured data.
 */
import { useState, useRef } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Button, TextArea } from '../../../shared/components'
import './ResumeUpload.css'

// Set up PDF.js worker using Vite's ?url import
GlobalWorkerOptions.workerSrc = pdfjsWorker

function ResumeUpload({ onParse, isProcessing, error }) {
  // Tab: 'upload' or 'paste'
  const [activeTab, setActiveTab] = useState('upload')

  // Pasted text
  const [pasteText, setPasteText] = useState('')

  // File drag state
  const [isDragging, setIsDragging] = useState(false)

  // File input ref
  const fileInputRef = useRef(null)

  /**
   * Extract text from PDF using pdf.js
   */
  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise

    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  }

  /**
   * Handle file selection (from click or drop)
   */
  const handleFile = async (file) => {
    if (!file) return

    // Check file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      alert('Please upload a PDF, DOCX, or TXT file')
      return
    }

    // Read file content
    try {
      let text = ''

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Plain text file
        text = await file.text()
      } else if (file.type === 'application/pdf') {
        // Extract text from PDF
        text = await extractPdfText(file)
        if (!text.trim()) {
          alert('Could not extract text from this PDF. It may be scanned/image-based. Please try pasting the text instead.')
          return
        }
      } else {
        // DOCX - complex format
        alert('DOCX parsing coming soon! For now, please copy the text from your document and use the "Paste Text" tab.')
        return
      }

      if (text.trim()) {
        onParse(text)
      }
    } catch (err) {
      console.error('Error reading file:', err)
      alert('Could not read file. Please try pasting the text instead.')
    }
  }

  /**
   * Handle drag events
   */
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  /**
   * Handle paste submit
   */
  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      onParse(pasteText)
    }
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="resume-upload">
        <div className="processing-overlay">
          <div className="spinner" />
          <p className="text-lg font-bold">Analyzing your resume...</p>
          <p className="text-light">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resume-upload">
      {/* Error display */}
      {error && (
        <div className="upload-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="upload-tabs">
        <button
          type="button"
          className={`upload-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`upload-tab ${activeTab === 'paste' ? 'active' : ''}`}
          onClick={() => setActiveTab('paste')}
        >
          Paste Text
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="drop-zone-icon">+</span>
          <div className="drop-zone-text">
            <p>Drop your resume here</p>
            <p>or click to browse (PDF, TXT)</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept=".txt,.pdf,.docx"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div className="paste-area">
          <TextArea
            placeholder="Paste your resume text here...

Example:
John Doe
Software Engineer | john@email.com

EXPERIENCE
Senior Developer at Tech Corp (2020-Present)
- Built scalable microservices
- Led team of 5 developers

SKILLS
JavaScript, React, Node.js, Python"
            value={pasteText}
            onChange={setPasteText}
            rows={12}
          />
          <p className="paste-hint">
            Tip: Copy all text from your resume PDF/document and paste above
          </p>
          <div className="upload-actions">
            <Button
              variant="primary"
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim()}
            >
              Analyze Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUpload
