'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Star } from 'lucide-react'
import { cardHover } from '@/lib/animations'
import { normalizeImagePath } from '@/lib/utils'

interface Partenaire {
  id: number
  nom: string
  slug?: string | null
  categorie: string
  logo: string
  description: string
  site?: string | null
}

interface PartnerCardProps {
  partenaire: Partenaire
  featured?: boolean
}

export function PartnerCard({ partenaire, featured = false }: PartnerCardProps) {
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
        <p className={`text-center line-clamp-3 flex-1 ${
          featured ? 'text-sm text-neutral-300' : 'text-xs text-neutral-400'
        }`}>
          {partenaire.description}
        </p>

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
            <a
              href={partenaire.site}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center justify-center gap-1 text-xs font-medium transition-colors ${
                featured
                  ? 'text-neutral-400 hover:text-neutral-300'
                  : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              Visiter le site
              <ExternalLink className="w-3 h-3" />
            </a>
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
