/**
 * Toast Component
 *
 * Shows temporary notification messages.
 * Auto-dismisses after a timeout.
 *
 * Usage:
 *   <Toast
 *     message="Saved successfully!"
 *     type="success"
 *     onClose={() => setToast(null)}
 *   />
 */
import { useEffect } from 'react'
import './Toast.css'

function Toast({
  message,
  type = 'info', // success | error | warning | info
  duration = 3000, // ms before auto-close
  onClose
}) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  )
}

// Container for multiple toasts (position at top-right)
function ToastContainer({ children }) {
  return <div className="toast-container">{children}</div>
}

export { Toast, ToastContainer }
export default Toast
