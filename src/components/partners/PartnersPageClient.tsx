'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { sitePill } from '@/components/site/styles'
import { cn } from '@/lib/utils'
import { PartnersSections } from './PartnersSections'

interface Partenaire {
  id: number
  nom: string
  slug?: string | null
  categorie: string
  logo: string
  description: string
  site?: string | null
  partenaire_majeur: boolean
  ordre: number
  promoActive?: boolean
  promoTitre?: string | null
  promoCode?: string | null
  promoExpiration?: Date | string | null
}

interface PartnersPageClientProps {
  partenaires: Partenaire[]
  categories: string[]
}

export function PartnersPageClient({ partenaires, categories }: PartnersPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get('categorie') ?? 'Tous'
  const queryParam = searchParams.get('q') ?? ''

  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [showFilters, setShowFilters] = useState(false)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // Synchronisation différée de la recherche dans l'URL (partage de lien)
  useEffect(() => {
    if (searchQuery === queryParam) return
    const timeout = setTimeout(() => updateParams({ q: searchQuery || null }), 400)
    return () => clearTimeout(timeout)
  }, [searchQuery, queryParam, updateParams])

  const hasActiveFilter = selectedCategory !== 'Tous' || searchQuery.trim().length > 0

  // Filtrer les partenaires
  const filteredPartenaires = useMemo(() => {
    let filtered = partenaires

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter((p) => p.categorie === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.categorie.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [partenaires, selectedCategory, searchQuery])

  return (
    <div>
      {/* Recherche et filtres */}
      <div className="mb-14 border-b border-white/10 pb-6 md:mb-20">
        <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-center lg:justify-between">
          <div className="flex gap-2 lg:w-80 lg:shrink-0">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
              <label htmlFor="recherche-partenaire" className="sr-only">
                Rechercher un partenaire
              </label>
              <input
                id="recherche-partenaire"
                type="search"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-md border border-white/10 bg-neutral-900 pl-10 pr-11 text-sm text-white transition-colors placeholder:text-neutral-500 hover:border-white/20 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
              aria-controls="filtres-categories"
              className={cn(
                'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden',
                showFilters || selectedCategory !== 'Tous'
                  ? 'border-primary-500/60 bg-primary-500/10 text-primary-300'
                  : 'border-white/10 bg-neutral-900 text-neutral-300'
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Catégories
            </button>
          </div>

          <div
            id="filtres-categories"
            className={cn(showFilters ? 'flex' : 'hidden', 'flex-wrap gap-2 sm:flex')}
            role="group"
            aria-label="Filtrer par catégorie"
          >
            <CategoryChip
              label="Tous"
              active={selectedCategory === 'Tous'}
              onClick={() => updateParams({ categorie: null })}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => updateParams({ categorie: cat })}
              />
            ))}
          </div>
        </div>

        {hasActiveFilter && (
          <p className="mt-4 text-sm text-neutral-400" aria-live="polite">
            {filteredPartenaires.length} partenaire{filteredPartenaires.length > 1 ? 's' : ''} affiché
            {filteredPartenaires.length > 1 ? 's' : ''} sur {partenaires.length}
            {selectedCategory !== 'Tous' && (
              <>
                {' '}· catégorie <span className="font-semibold text-primary-400">{selectedCategory}</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Résultats */}
      {filteredPartenaires.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
          <h2 className="font-display text-xl font-bold text-white">Aucun partenaire trouvé</h2>
          <p className="mt-2 text-sm text-neutral-400">Essayez de modifier votre recherche ou vos filtres.</p>
        </div>
      ) : (
        <PartnersSections partenaires={filteredPartenaires} />
      )}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={sitePill({ active })}
    >
      {label}
    </button>
  )
}
