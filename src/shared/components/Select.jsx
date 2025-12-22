/**
 * Select Component
 *
 * Custom styled dropdown - no native browser styling.
 * Matches the Nano Banana Pro design (thick borders, offset shadow).
 *
 * Usage:
 *   <Select
 *     label="Choose Model"
 *     value={model}
 *     onChange={setModel}
 *     options={[
 *       { value: 'mistral', label: 'Mistral' },
 *       { value: 'llama2', label: 'Llama 2' }
 *     ]}
 *   />
 */
import { useState, useRef, useEffect } from 'react'
import './Select.css'

function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`select-wrapper ${className}`} ref={selectRef}>
      {label && <label className="select-label">{label}</label>}

      <button
        type="button"
        className={`select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="select-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="select-dropdown">
          {options.length === 0 ? (
            <div className="select-empty">No options available</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {option.description && (
                  <span className="select-option-desc">{option.description}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Select
