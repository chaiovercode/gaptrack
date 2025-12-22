/**
 * Shared Components - Central Export
 *
 * This file exports all shared components from one place.
 * Instead of importing from individual files, import from here:
 *
 * BEFORE (messy):
 *   import Button from '../shared/components/Button'
 *   import Card from '../shared/components/Card'
 *
 * AFTER (clean):
 *   import { Button, Card } from '../shared/components'
 */

export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Container } from './Container'
export { default as Input } from './Input'
export { default as TextArea } from './TextArea'
export { default as Select } from './Select'
export { default as Modal } from './Modal'
export { Toast, ToastContainer } from './Toast'
export { Layout } from './Layout'
