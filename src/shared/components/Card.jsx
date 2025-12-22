/**
 * Card Component
 *
 * A container for content with consistent styling.
 * Think of it as a "box" that holds related content.
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card variant="outlined">Outlined card</Card>
 *   <Card padding="lg">More padding</Card>
 */
import './Card.css'

function Card({
  children,
  variant = 'elevated',  // elevated | outlined | flat
  padding = 'md',        // sm | md | lg | none
  className = '',
  onClick,
  ...props
}) {
  const classNames = [
    'card',
    `card-${variant}`,
    `card-p-${padding}`,
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export default Card
