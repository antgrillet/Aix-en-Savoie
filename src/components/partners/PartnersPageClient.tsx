'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PartnerCard } from './PartnerCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

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
  const shouldReduceMotion = useReducedMotion()

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

  const partenairesMajeurs = filteredPartenaires.filter((p) => p.partenaire_majeur)
  const autresPartenaires = filteredPartenaires.filter((p) => !p.partenaire_majeur)

  return (
    <div className="space-y-10">
      {/* Vitrine des partenaires majeurs */}
      {partenairesMajeurs.length > 0 && (
        <section className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Partenaires majeurs
            </h2>
            <p className="text-neutral-400 text-sm mt-2">
              Ils soutiennent le club au quotidien et rendent notre projet possible
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {partenairesMajeurs.map((partenaire) => (
              <motion.div key={partenaire.id} variants={shouldReduceMotion ? undefined : staggerItem}>
                <PartnerCard partenaire={partenaire} featured />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Recherche et filtres - secondaires */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <label htmlFor="recherche-partenaire" className="sr-only">
              Rechercher un partenaire
            </label>
            <input
              id="recherche-partenaire"
              type="search"
              placeholder="Rechercher un partenaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/60 border border-zinc-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
            aria-controls="filtres-categories"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900/60 text-sm font-semibold text-neutral-300 hover:bg-zinc-800 transition-colors sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Catégories
            {selectedCategory !== 'Tous' && (
              <span className="text-primary-400">· {selectedCategory}</span>
            )}
          </button>
        </div>

        <div
          id="filtres-categories"
          className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2`}
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

        {hasActiveFilter && (
          <p className="text-xs text-neutral-400">
            {filteredPartenaires.length} partenaire{filteredPartenaires.length > 1 ? 's' : ''} affiché
            {filteredPartenaires.length > 1 ? 's' : ''} sur {partenaires.length}
          </p>
        )}
      </section>

      {/* Résultats */}
      {filteredPartenaires.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-2">Aucun partenaire trouvé</h3>
          <p className="text-neutral-300 text-sm">
            Essayez de modifier votre recherche ou vos filtres
          </p>
        </div>
      ) : (
        autresPartenaires.length > 0 && (
          <section className="space-y-5">
            {partenairesMajeurs.length > 0 && (
              <h2 className="text-xl md:text-2xl font-display font-bold text-white text-center">
                Tous nos partenaires
              </h2>
            )}

            <motion.div
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {autresPartenaires.map((partenaire) => (
                <motion.div key={partenaire.id} variants={shouldReduceMotion ? undefined : staggerItem}>
                  <PartnerCard partenaire={partenaire} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        active
          ? 'bg-primary-500 text-white'
          : 'bg-zinc-900/60 text-neutral-400 border border-zinc-700 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  )
}
