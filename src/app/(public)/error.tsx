'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Eyebrow } from '@/components/site/Eyebrow'
import { container, siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Public page error:', error)
  }, [error])

  return (
    <section className="relative isolate overflow-hidden bg-neutral-950">
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />

      <div className={cn(container, 'flex min-h-[75svh] flex-col justify-center pb-20 pt-32 md:pt-40')}>
        <Eyebrow className="mb-5">Erreur</Eyebrow>
        <h1 className="max-w-3xl font-headline text-5xl text-white sm:text-6xl lg:text-7xl">Temps mort !</h1>
        <p className="mt-5 max-w-xl text-base text-neutral-300 md:text-lg">
          Impossible de charger cette page. Veuillez réessayer dans quelques instants.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={siteButton({ size: 'lg' })}>
            <RotateCcw />
            Réessayer
          </button>
          <Link href="/" className={siteButton({ variant: 'outline', size: 'lg' })}>
            Retour à l&apos;accueil
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 font-mono text-xs text-neutral-600">Référence : {error.digest}</p>
        )}
      </div>
    </section>
  )
}
