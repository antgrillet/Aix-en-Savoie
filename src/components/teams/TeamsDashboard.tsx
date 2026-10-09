'use client'

import Image from 'next/image'
import { cn, normalizeImagePath } from '@/lib/utils'

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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {equipes.map((equipe) => {
        const isFiltered = activeCategory !== 'all' && equipe.categorie !== activeCategory

        return (
          <button
            key={equipe.id}
            type="button"
            onClick={() => scrollToTeam(equipe.id)}
            className={cn(
              'group rounded-xl border border-white/10 bg-neutral-900 p-3 text-left transition-colors duration-200 hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              isFiltered && 'opacity-50'
            )}
          >
            <div className="relative mb-3 h-24 overflow-hidden rounded-md bg-neutral-800">
              <Image
                src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="line-clamp-1 font-display font-bold text-white">{equipe.nom}</p>
            <p className="text-sm text-primary-400">{equipe.categorie}</p>
          </button>
        )
      })}
    </div>
  )
}
