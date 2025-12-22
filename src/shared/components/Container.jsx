/**
 * Container Component
 *
 * Centers content and limits max width.
 * Use this to wrap page content.
 *
 * Usage:
 *   <Container>Page content</Container>
 *   <Container size="sm">Narrow content</Container>
 */
import './Container.css'

function Container({
  children,
  size = 'default',  // sm | default | lg | full
  className = '',
  ...props
}) {
  const classNames = [
    'container',
    `container-${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}

export default Container
