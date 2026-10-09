'use client'

import { useSyncExternalStore } from 'react'
import { Toaster as Sonner } from 'sonner'

const emptySubscribe = () => () => {}

/**
 * Notifications globales (enregistrements admin, espace bénévoles…).
 * Les couleurs suivent les tokens du thème : sombres sur le site public,
 * claires dans l'admin. Elles passent par `style` car la feuille de sonner,
 * hors couche Tailwind, l'emporte sur les classes utilitaires.
 */
export function Toaster() {
  // Monté uniquement côté client pour éviter les écarts d'hydratation
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isMounted) {
    return null
  }

  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  )
}
