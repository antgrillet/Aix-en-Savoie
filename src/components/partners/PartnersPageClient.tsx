'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PartnerListItem, type PartenaireListe } from './PartnerListItem'

interface PartnersPageClientProps {
  partenaires: PartenaireListe[]
  /** Catégories dans l'ordre d'affichage des sections (institutions en tête). */
  categories: string[]
}

// Recherche insensible à la casse et aux accents
function normaliser(texte: string) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function pluriel(n: number, mot: string) {
  return `${n} ${mot}${n > 1 ? 's' : ''}`
}

export function PartnersPageClient({ partenaires, categories }: PartnersPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categorieParam = searchParams.get('categorie')
  const selectedCategory = categorieParam && categories.includes(categorieParam) ? categorieParam : null
  const avecOffre = searchParams.get('offre') === '1'
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

  const nombreOffres = useMemo(() => partenaires.filter((p) => p.offre).length, [partenaires])

  const filteredPartenaires = useMemo(() => {
    let filtered = partenaires

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categorie === selectedCategory)
    }

    if (avecOffre) {
      filtered = filtered.filter((p) => p.offre)
    }

    const query = normaliser(searchQuery.trim())
    if (query) {
      filtered = filtered.filter(
        (p) =>
          normaliser(p.nom).includes(query) ||
          normaliser(p.description).includes(query) ||
          normaliser(p.categorie).includes(query) ||
          (p.offre ? normaliser(p.offre.titre).includes(query) : false)
      )
    }

    return filtered
  }, [partenaires, selectedCategory, avecOffre, searchQuery])

  // Regroupement par secteur, dans l'ordre des catégories reçu du serveur
  const sections = useMemo(
    () =>
      categories
        .map((categorie) => ({
          categorie,
          items: filteredPartenaires.filter((p) => p.categorie === categorie),
        }))
        .filter((section) => section.items.length > 0),
    [categories, filteredPartenaires]
  )

  const hasActiveFilter = selectedCategory !== null || avecOffre || searchQuery.trim().length > 0
  const filtreActifLabel = avecOffre ? 'Avec offre' : selectedCategory

  return (
    <div className="space-y-8">
      {/* Recherche et filtres */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <label htmlFor="recherche-partenaire" className="sr-only">
              Rechercher un partenaire
            </label>
            <input
              id="recherche-partenaire"
              type="search"
              placeholder="Rechercher un partenaire"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-base text-white backdrop-blur-sm transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
            aria-controls="filtres-categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Catégories
            {filtreActifLabel && <span className="text-primary-400">· {filtreActifLabel}</span>}
          </button>
        </div>

        <div
          id="filtres-categories"
          className={`${showFilters ? 'flex' : 'hidden'} flex-wrap gap-2 sm:flex sm:justify-center`}
          role="group"
          aria-label="Filtrer les partenaires"
        >
          <FilterChip
            label="Tous"
            active={!selectedCategory && !avecOffre}
            onClick={() => updateParams({ categorie: null, offre: null })}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() => updateParams({ categorie: cat, offre: null })}
            />
          ))}
          {nombreOffres > 0 && (
            <FilterChip
              label="Avec offre"
              active={avecOffre}
              onClick={() => updateParams({ offre: avecOffre ? null : '1', categorie: null })}
            />
          )}
        </div>

        {hasActiveFilter && (
          <p className="text-sm text-neutral-400" aria-live="polite">
            {pluriel(filteredPartenaires.length, 'partenaire')} affiché
            {filteredPartenaires.length > 1 ? 's' : ''} sur {partenaires.length}
          </p>
        )}
      </div>

      {/* Avantages licenciés */}
      {nombreOffres > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary-500/45 bg-primary-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-bold text-white">Les avantages licenciés</p>
            <p className="text-sm text-neutral-300">
              {nombreOffres > 1
                ? 'Certains partenaires proposent une offre aux membres du club.'
                : 'Un partenaire propose une offre aux membres du club.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateParams({ offre: avecOffre ? null : '1', categorie: null })}
            aria-pressed={avecOffre}
            className={`inline-flex min-h-11 items-center justify-center self-start rounded-full px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 sm:self-auto ${
              avecOffre
                ? 'border border-primary-500/60 text-primary-400 hover:bg-primary-500/15'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {avecOffre ? 'Voir tous les partenaires' : `Avec offre · ${nombreOffres}`}
          </button>
        </div>
      )}

      {/* Sections par secteur */}
      {sections.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-12 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">Aucun partenaire trouvé</h2>
          <p className="text-sm text-neutral-300">Essayez de modifier votre recherche ou vos filtres</p>
        </div>
      ) : (
        sections.map(({ categorie, items }, index) => {
          const titreId = `secteur-${index}`
          return (
            <section key={categorie} aria-labelledby={titreId} className="space-y-4">
              <div className="flex items-baseline gap-4">
                <h2 id={titreId} className="font-display text-2xl font-extrabold text-white md:text-[28px]">
                  {categorie}
                </h2>
                <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
                  {pluriel(items.length, 'partenaire')}
                </span>
                <span className="h-px flex-1 self-center bg-white/10" aria-hidden="true" />
              </div>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {items.map((partenaire) => (
                  <li key={partenaire.id}>
                    <PartnerListItem partenaire={partenaire} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const activeClass = 'border-primary-500 bg-primary-500 text-white'
  const idleClass = 'border-white/20 text-neutral-200 hover:border-white/40 hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        active ? `${activeClass} font-bold` : idleClass
      }`}
    >
      {label}
    </button>
  )
}
