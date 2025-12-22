/**
 * Modal Component
 *
 * Custom popup/dialog - no native browser styling.
 * Matches the Nano Banana Pro design.
 *
 * Usage:
 *   <Modal
 *     isOpen={showModal}
 *     onClose={() => setShowModal(false)}
 *     title="Confirm Action"
 *   >
 *     <p>Are you sure?</p>
 *     <Button onClick={handleConfirm}>Yes</Button>
 *   </Modal>
 */
import { useEffect } from 'react'
import './Modal.css'

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm | md | lg
  showClose = true
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true">
        {/* Header */}
        {(title || showClose) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showClose && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

// Sub-components for convenience
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return <div className={`modal-footer ${className}`}>{children}</div>
}

export default Modal
