/**
 * Button Component
 *
 * Reusable button with different variants.
 * Uses global CSS variables - no hardcoded colors here.
 *
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="outline" size="sm">Small</Button>
 */
import './Button.css'

function Button({
  children,
  variant = 'primary',   // primary | secondary | outline
  size = 'md',           // sm | md | lg
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
