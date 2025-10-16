'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { normalizeImagePath } from '@/lib/utils'

interface Equipe {
  id: number
  nom: string
  categorie: string
  photo: string
}

interface TeamsDashboardProps {
  equipes: Equipe[]
  activeCategory: string
}

export function TeamsDashboard({ equipes, activeCategory }: TeamsDashboardProps) {
  // Fonction pour scroller vers l'équipe dans la liste
  const scrollToTeam = (id: number) => {
    const element = document.getElementById(`equipe-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {equipes.map((equipe) => {
        const isFiltered = activeCategory !== 'all' && equipe.categorie !== activeCategory

        return (
          <motion.button
            key={equipe.id}
            type="button"
            onClick={() => scrollToTeam(equipe.id)}
            className={`bg-zinc-800/80 backdrop-blur-sm rounded-lg p-4 transition-all hover:bg-zinc-700/90 hover:scale-105 hover:shadow-lg text-left ${
              isFiltered ? 'opacity-50' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="h-24 bg-zinc-900 rounded mb-3 overflow-hidden relative">
              <Image
                src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
                alt={equipe.nom}
                fill
                className="object-cover transition-transform hover:scale-110"
              />
            </div>
            <h4 className="text-white font-bold mb-1 line-clamp-1">{equipe.nom}</h4>
            <p className="text-primary-500 text-sm">{equipe.categorie}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
