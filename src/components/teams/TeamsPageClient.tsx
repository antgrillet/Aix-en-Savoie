'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TeamsFilters } from './TeamsFilters'
import { TeamsGrid } from './TeamsGrid'
import { buildCategoryOptions } from './categories'

interface Entrainement {
  id: number
  jour: string
  horaire: string
  lieu?: string | null
}

interface Classement {
  id: number
  position: number
  club: string
  points: number
}

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string | null
  domicile: boolean
  logoAdversaire: string | null
}

interface Equipe {
  id: number
  nom: string
  categorie: string
  description: string
  entraineur: string
  matches: string | null
  photo: string
  slug: string
  entrainements: Entrainement[]
  classement: Classement[]
  matchs: Match[]
}

interface TeamsPageClientProps {
  equipes: Equipe[]
}

export function TeamsPageClient({ equipes }: TeamsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('categorie') ?? 'all'

  const categories = useMemo(
    () => buildCategoryOptions(equipes.map((equipe) => equipe.categorie)),
    [equipes]
  )

  const filteredEquipes = useMemo(
    () =>
      activeCategory === 'all'
        ? equipes
        : equipes.filter((equipe) => equipe.categorie === activeCategory),
    [equipes, activeCategory]
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (category === 'all') {
        params.delete('categorie')
      } else {
        params.set('categorie', category)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <div id="liste-equipes">
      <h2 className="sr-only">Liste des équipes</h2>

      {/* Barre de filtres */}
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:mb-10 md:flex-row md:items-center md:justify-between">
        <TeamsFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <p className="shrink-0 text-sm text-neutral-400" aria-live="polite">
          {filteredEquipes.length} équipe{filteredEquipes.length > 1 ? 's' : ''}
        </p>
      </div>

      {filteredEquipes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center text-neutral-400">
          Aucune équipe dans cette catégorie.
        </p>
      ) : (
        <TeamsGrid equipes={filteredEquipes} />
      )}
    </div>
  )
}
