'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, Calendar, MapPin } from 'lucide-react'
import { cardHover } from '@/lib/animations'

interface Entrainement {
  jour: string
  heureDebut: string
  heureFin: string
  lieu: string
}

interface Equipe {
  id: number
  nom: string
  categorie: string
  niveau: string
  photo: string
  slug: string
  entrainements: Entrainement[]
}

interface TeamCardProps {
  equipe: Equipe
}

export function TeamCard({ equipe }: TeamCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Link href={`/equipes/${equipe.slug}`} className="group block">
        <article className="card h-full">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={equipe.photo}
              alt={equipe.nom}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                {equipe.categorie}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
              {equipe.nom}
            </h3>
            <p className="text-neutral-600 text-sm mb-4">{equipe.niveau}</p>

            {/* Entrainements */}
            {equipe.entrainements.length > 0 && (
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold">
                    {equipe.entrainements[0].jour}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span>
                    {equipe.entrainements[0].heureDebut} -{' '}
                    {equipe.entrainements[0].heureFin}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>{equipe.entrainements[0].lieu}</span>
                </div>
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
