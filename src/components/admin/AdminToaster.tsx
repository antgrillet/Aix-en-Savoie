'use client'

import { useSyncExternalStore } from 'react'
import { Toaster as Sonner } from 'sonner'

const emptySubscribe = () => () => {}

const toasterStyle = {
  fontFamily: 'var(--font-sans)',
  '--border-radius': '10px',
  '--normal-bg': 'var(--adm-paper)',
  '--normal-text': 'var(--adm-ink)',
  '--normal-border': 'var(--adm-line)',
  '--success-bg': 'var(--adm-ok-soft)',
  '--success-text': 'var(--adm-ok)',
  '--success-border': '#b7dfc3',
  '--error-bg': 'var(--adm-bad-soft)',
  '--error-text': 'var(--adm-bad)',
  '--error-border': '#f1b8b2',
} as React.CSSProperties

/**
 * Retours d'action de l'admin (`toast.success`, `toast.error` de `sonner`).
 * Monté une fois par le layout, hors de l'arbre `data-admin` : c'est une
 * surcouche, elle garde son ombre. Vert pour une confirmation, rouge pour une
 * erreur, toujours avec une phrase.
 */
export function AdminToaster() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isMounted) return null

  return (
    <Sonner
      position="top-right"
      richColors
      style={toasterStyle}
      containerAriaLabel="Notifications"
      toastOptions={{
        classNames: {
          toast: 'text-[0.9375rem] font-medium',
          description: 'text-[0.875rem] font-normal opacity-90',
        },
      }}
    />
  )
}
