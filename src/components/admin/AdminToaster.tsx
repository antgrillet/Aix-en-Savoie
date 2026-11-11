'use client'

import { useSyncExternalStore } from 'react'
import { Toaster as Sonner } from 'sonner'

const emptySubscribe = () => () => {}

const toasterStyle = {
  fontFamily: 'var(--font-sans)',
  '--border-radius': '3px',
  '--normal-bg': 'var(--adm-ink)',
  '--normal-text': 'var(--adm-paper)',
  '--normal-border': 'var(--adm-ink)',
  '--success-bg': 'var(--adm-ink)',
  '--success-text': 'var(--adm-paper)',
  '--success-border': 'var(--adm-ink)',
  '--error-bg': 'var(--adm-red)',
  '--error-text': 'var(--adm-paper)',
  '--error-border': 'var(--adm-red)',
} as React.CSSProperties

/**
 * Retours d'action de l'admin (`toast.success`, `toast.error` de `sonner`).
 * Monté une fois par le layout, hors de l'arbre `data-admin` : c'est une
 * surcouche, elle garde son ombre. Bloc noir pour une confirmation, rouge pour
 * une erreur.
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
          description: 'text-[0.8125rem] font-normal opacity-90',
        },
      }}
    />
  )
}
