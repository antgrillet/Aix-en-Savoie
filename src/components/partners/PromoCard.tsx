'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, Check, Clock, Copy, Store, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { formatParis } from '@/lib/match-format'

interface PromoCardProps {
  titre: string
  description?: string | null
  code?: string | null
  expiration?: Date | string | null
  conditions?: string | null
  /** Conservée pour compatibilité : l'offre suit désormais la charte orange/noir du club */
  brandColor?: string
}

/** Coupon de l'offre réservée aux licenciés (fiche partenaire) */
export function PromoCard({ titre, description, code, expiration, conditions }: PromoCardProps) {
  const [copied, setCopied] = useState(false)

  const { isExpired, daysLeft } = useMemo(() => {
    if (expiration) {
      const now = new Date()
      const exp = new Date(expiration)
      const diff = exp.getTime() - now.getTime()
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return { isExpired: days < 0, daysLeft: days >= 0 ? days : null }
    }
    return { isExpired: false, daysLeft: null }
  }, [expiration])

  const copyToClipboard = async () => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copié dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  // Ne rien afficher si l'offre est expirée
  if (isExpired) return null

  return (
    <div className="grid overflow-hidden rounded-xl border border-primary-500/40 bg-neutral-900 md:grid-cols-[minmax(0,1fr)_20rem]">
      {/* Détail de l'offre */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-500/25 bg-primary-500/10 text-primary-400">
            <Tag className="size-5" aria-hidden />
          </span>
          <p className="font-eyebrow text-xs text-primary-400">Offre exclusive licenciés</p>
          {daysLeft !== null && daysLeft <= 7 && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-primary-500/15 px-2 py-1 text-xs font-semibold text-primary-300">
              <Clock className="size-3" aria-hidden />
              {daysLeft === 0 ? 'Dernier jour !' : `${daysLeft} j restants`}
            </span>
          )}
        </div>

        <h3 className="mt-5 font-headline text-3xl text-white sm:text-4xl">{titre}</h3>
        {description && <p className="mt-3 max-w-2xl leading-relaxed text-neutral-300">{description}</p>}

        {expiration && daysLeft !== null && daysLeft > 7 && (
          <p className="mt-4 text-sm text-neutral-400">
            Valable jusqu&apos;au{' '}
            {formatParis(expiration, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {conditions && (
          <p className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs text-neutral-500">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {conditions}
          </p>
        )}
      </div>

      {/* Talon du coupon : code à copier ou mention en magasin */}
      <div className="flex flex-col justify-center gap-3 border-t-2 border-dashed border-neutral-950/25 bg-primary-500 p-6 text-neutral-950 sm:p-8 md:border-l-2 md:border-t-0">
        {code ? (
          <>
            <p className="font-eyebrow text-xs text-neutral-950/70">Votre code promo</p>
            <button
              type="button"
              onClick={copyToClipboard}
              aria-label={`Copier le code promo ${code}`}
              className="group flex min-h-13 w-full items-center justify-between gap-3 rounded-md bg-neutral-950 px-4 text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
            >
              <span className="font-mono text-lg font-bold tracking-widest">{code}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 group-hover:text-primary-300">
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? 'Copié !' : 'Copier'}
              </span>
            </button>
          </>
        ) : (
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-display font-bold">Offre en magasin</p>
              <p className="mt-1 text-sm text-neutral-950/80">
                Mentionnez «&nbsp;HBC Aix-en-Savoie&nbsp;» pour bénéficier de l&apos;offre.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
