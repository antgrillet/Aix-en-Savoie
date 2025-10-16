'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-500 to-secondary-700 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-white">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold font-mont text-neutral-900 mb-2">
            Une erreur est survenue
          </h1>
          <p className="text-neutral-600 mb-6">
            Désolé, quelque chose s'est mal passé. Notre équipe a été notifiée.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold font-mont hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="block w-full px-6 py-3 border-2 border-secondary-600 text-secondary-600 rounded-lg font-bold font-mont hover:bg-secondary-50 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
