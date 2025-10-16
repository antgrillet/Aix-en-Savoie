'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { cardHover } from '@/lib/animations'
import { normalizeImagePath } from '@/lib/utils'

interface Partenaire {
  id: number
  nom: string
  categorie: string
  logo: string
  description: string
  site?: string | null
}

interface PartnerCardProps {
  partenaire: Partenaire
}

export function PartnerCard({ partenaire }: PartnerCardProps) {
  const content = (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 border border-neutral-200 hover:border-primary-500"
    >
      {/* Logo */}
      <div className="flex-1 flex items-center justify-center p-4 mb-4 bg-neutral-50 rounded-lg">
        <div className="relative w-full h-32">
          <Image
            src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
            alt={partenaire.nom}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-display font-bold text-neutral-900 text-center">
          {partenaire.nom}
        </h3>
        <p className="text-sm text-neutral-600 text-center line-clamp-3">
          {partenaire.description}
        </p>
        {partenaire.site && (
          <div className="flex items-center justify-center text-primary-500 font-semibold text-sm pt-2">
            Visiter le site
            <ExternalLink className="w-4 h-4 ml-1" />
          </div>
        )}
      </div>
    </motion.div>
  )

  if (partenaire.site) {
    return (
      <a
        href={partenaire.site}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {content}
      </a>
    )
  }

  return <div className="h-full">{content}</div>
}
