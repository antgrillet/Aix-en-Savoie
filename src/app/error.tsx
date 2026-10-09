'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { siteButton } from '@/components/site/styles'

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

  // Rendue hors du layout public : on pose nous-mêmes le thème sombre du site
  return (
    <div className="theme-site dark relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-16 text-center text-neutral-100">
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />

      <Link
        href="/"
        aria-label="HBC Aix-en-Savoie — accueil"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Image src="/img/home/logo.png" alt="" width={96} height={96} priority className="size-20 object-contain sm:size-24" />
      </Link>

      <p aria-hidden className="mt-8 font-headline text-7xl text-primary-500 sm:text-9xl">
        Temps mort
      </p>
      <h1 className="mt-4 font-headline text-4xl text-white sm:text-5xl">Une erreur est survenue</h1>
      <p className="mt-4 max-w-md text-balance text-base text-neutral-400 md:text-lg">
        Désolé, quelque chose s&apos;est mal passé. Notre équipe a été notifiée.
      </p>

      <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button type="button" onClick={reset} className={siteButton({ size: 'lg' })}>
          <RotateCcw />
          Réessayer
        </button>
        <Link href="/" className={siteButton({ variant: 'outline', size: 'lg' })}>
          Retour à l&apos;accueil
        </Link>
      </div>

      {error.digest && <p className="mt-10 font-mono text-xs text-neutral-600">Référence : {error.digest}</p>}
    </div>
  )
}
