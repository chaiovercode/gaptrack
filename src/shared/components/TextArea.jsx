/**
 * TextArea Component
 *
 * Multi-line text input (for JD paste, notes, etc.)
 *
 * Usage:
 *   <TextArea label="Job Description" value={jd} onChange={setJd} />
 *   <TextArea rows={10} placeholder="Paste job description here..." />
 */
import './TextArea.css'

function TextArea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 5,
  error = '',
  disabled = false,
  className = '',
  ...props
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`textarea ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      {error && <span className="textarea-error-text">{error}</span>}
    </div>
  )
}

export default TextArea
