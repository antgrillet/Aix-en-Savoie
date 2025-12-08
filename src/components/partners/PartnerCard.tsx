'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Star, Tag, Copy, Check, Store, Clock } from 'lucide-react'
import { cardHover } from '@/lib/animations'
import { normalizeImagePath } from '@/lib/utils'
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

  const content = (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={`h-full flex flex-col transition-all duration-300 relative overflow-hidden ${
        featured
          ? 'bg-gradient-to-br from-primary-500/10 via-zinc-800/80 to-secondary-500/10 border-2 border-primary-500/50 rounded-2xl shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30'
          : 'bg-zinc-800/60 border border-zinc-700 rounded-xl shadow-lg hover:border-primary-500'
      }`}
    >
      {/* Badge partenaire majeur */}
      {featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-primary-500 rounded-full shadow-lg">
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-xs font-bold text-white uppercase">Majeur</span>
          </div>
        </div>
      )}

      {/* Badge offre speciale */}
      {showPromo && (
        <div className={`absolute ${featured ? 'top-14' : 'top-3'} right-3 z-10`}>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full shadow-lg animate-pulse">
            <Tag className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white">Offre</span>
          </div>
        </div>
      )}

      {/* Effet de brillance animé pour les featured */}
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Logo */}
      <div className={`flex-1 flex items-center justify-center p-6 ${
        featured ? 'bg-white/5' : 'bg-zinc-900/40'
      } rounded-t-xl`}>
        <div className={`relative w-full ${featured ? 'h-40' : 'h-32'}`}>
          <Image
            src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
            alt={partenaire.nom}
            fill
            className="object-contain filter drop-shadow-lg"
            sizes={featured ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 25vw'}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3 flex flex-col">
        {/* Catégorie */}
        <div className="flex justify-center">
          <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
            featured
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
              : 'bg-zinc-700/50 text-neutral-400'
          }`}>
            {partenaire.categorie}
          </span>
        </div>

        {/* Nom */}
        <h3 className={`font-display font-bold text-center ${
          featured ? 'text-xl text-white' : 'text-lg text-white'
        }`}>
          {partenaire.nom}
        </h3>

        {/* Description */}
        <p className={`text-center line-clamp-2 ${
          featured ? 'text-sm text-neutral-300' : 'text-xs text-neutral-400'
        }`}>
          {partenaire.description}
        </p>

        {/* Section Code Promo intégrée */}
        {showPromo && (
          <div className="mt-2 p-3 bg-green-500/10 border border-dashed border-green-500/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-green-400 font-semibold text-xs line-clamp-1 flex-1">
                {partenaire.promoTitre}
              </p>
              {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-400 text-[10px] font-semibold flex-shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                  {daysLeft === 0 ? 'Dernier jour' : `${daysLeft}j`}
                </div>
              )}
            </div>

            {partenaire.promoCode ? (
              <button
                onClick={copyCode}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-600 rounded-md transition-all group"
              >
                <span className="font-mono font-bold text-white tracking-wider text-sm">
                  {partenaire.promoCode}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-400 group-hover:text-green-400" />
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800/60 border border-zinc-700 rounded-md text-xs">
                <Store className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-neutral-300">Mentionnez le club</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <div className={`flex items-center justify-center font-semibold text-sm gap-1 ${
            featured
              ? 'text-primary-400 hover:text-primary-300'
              : 'text-primary-500 hover:text-primary-400'
          } transition-colors`}>
            En savoir plus
          </div>

          {partenaire.site && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(partenaire.site!, '_blank', 'noopener,noreferrer')
              }}
              className={`flex items-center justify-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                featured
                  ? 'text-neutral-400 hover:text-neutral-300'
                  : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              Visiter le site
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )

  // Link to detail page if slug exists, otherwise just display card
  if (partenaire.slug) {
    return (
      <Link href={`/partenaires/${partenaire.slug}`} className="block h-full">
        {content}
      </Link>
    )
  }

  return <div className="h-full">{content}</div>
}
