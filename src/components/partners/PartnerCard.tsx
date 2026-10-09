'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Clock, Copy, Star, Store, Tag } from 'lucide-react'
import { cn, normalizeImagePath } from '@/lib/utils'
import { toast } from 'sonner'

interface Partenaire {
  id: number
  nom: string
  slug?: string | null
  categorie: string
  logo: string
  description: string
  site?: string | null
  promoActive?: boolean
  promoTitre?: string | null
  promoCode?: string | null
  promoExpiration?: Date | string | null
}

interface PartnerCardProps {
  partenaire: Partenaire
  featured?: boolean
}

export function PartnerCard({ partenaire, featured = false }: PartnerCardProps) {
  const [copied, setCopied] = useState(false)

  // Vérifier si l'offre est expirée
  const isPromoExpired = partenaire.promoExpiration
    ? new Date(partenaire.promoExpiration) < new Date()
    : false

  // Calculer les jours restants
  const daysLeft = partenaire.promoExpiration
    ? Math.ceil((new Date(partenaire.promoExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Afficher la promo seulement si active et non expirée
  const showPromo = partenaire.promoActive && partenaire.promoTitre && !isPromoExpired

  const copyCode = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!partenaire.promoCode) return
    try {
      await navigator.clipboard.writeText(partenaire.promoCode)
      setCopied(true)
      toast.success('Code copié !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  const href = partenaire.slug ? `/partenaires/${partenaire.slug}` : null

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 p-2 transition-colors duration-200',
        href && 'hover:border-primary-500/60 has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-primary-500'
      )}
    >
      {/* Logo sur tuile blanche : les logos sont conçus pour un fond clair */}
      <div
        className={cn(
          // Proportions fixes : cartes alignées même quand majeurs et autres partenaires se côtoient
          'relative flex aspect-[2/1] items-center justify-center rounded-lg bg-white',
          featured ? 'p-8' : 'p-6'
        )}
      >
        <div className="relative size-full transition-transform duration-500 group-hover:scale-[1.03]">
          <Image
            src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
            alt={partenaire.nom}
            fill
            className="object-contain"
            sizes={featured ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'}
          />
        </div>

        {(featured || showPromo) && (
          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            {featured ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-neutral-950 px-1.5 py-1 font-eyebrow text-[0.6rem] text-primary-300">
                <Star className="size-2.5 fill-current" aria-hidden />
                Majeur
              </span>
            ) : (
              <span />
            )}
            {showPromo && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-primary-500 px-1.5 py-1 font-eyebrow text-[0.6rem] text-neutral-950">
                <Tag className="size-2.5" aria-hidden />
                Offre
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4 sm:px-4 sm:pb-4">
        <p className="font-eyebrow text-[0.65rem] text-primary-400">{partenaire.categorie}</p>
        <h3 className="mt-1.5 font-display text-lg font-bold leading-tight text-white transition-colors group-hover:text-primary-300">
          {href ? (
            // Lien étiré : toute la carte mène à la fiche partenaire
            <Link href={href} data-card-link className="after:absolute after:inset-0 focus-visible:outline-none">
              {partenaire.nom}
            </Link>
          ) : (
            partenaire.nom
          )}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
          {partenaire.description}
        </p>

        {/* Offre réservée aux licenciés */}
        {showPromo && (
          <div className="relative z-10 mt-4 rounded-lg border border-dashed border-primary-500/40 bg-primary-500/[0.07] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-semibold text-primary-300">{partenaire.promoTitre}</p>
              {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-primary-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary-300">
                  <Clock className="size-2.5" aria-hidden />
                  {daysLeft === 0 ? 'Dernier jour' : `${daysLeft} j`}
                </span>
              )}
            </div>

            {partenaire.promoCode ? (
              <button
                type="button"
                onClick={copyCode}
                aria-label={`Copier le code promo ${partenaire.promoCode}`}
                className="mt-2.5 flex min-h-10 w-full items-center justify-between gap-2 rounded-md bg-primary-500 px-3 text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <span className="font-mono text-sm font-bold tracking-wider">{partenaire.promoCode}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold">
                  {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                  {copied ? 'Copié' : 'Copier'}
                </span>
              </button>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-xs text-neutral-300">
                <Store className="size-3.5 shrink-0 text-primary-400" aria-hidden />
                Mentionnez le club en magasin
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {(href || partenaire.site) && (
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            {href ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-400 transition-colors group-hover:text-primary-300">
                En savoir plus
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            ) : (
              <span />
            )}
            {partenaire.site && (
              <a
                href={partenaire.site}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 -mr-1 inline-flex min-h-10 items-center gap-1 rounded-md px-1 text-xs font-medium text-neutral-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Site web
                <ArrowUpRight className="size-3.5" aria-hidden />
                <span className="sr-only">de {partenaire.nom} (nouvel onglet)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
