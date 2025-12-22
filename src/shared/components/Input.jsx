/**
 * Input Component
 *
 * Text input with label and error handling.
 *
 * Usage:
 *   <Input label="Email" value={email} onChange={setEmail} />
 *   <Input label="Name" error="Name is required" />
 */
import './Input.css'

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
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
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export default Input
