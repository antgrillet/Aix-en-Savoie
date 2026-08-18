'use client'

import { motion, useReducedMotion } from 'framer-motion'

export interface CategoryOption {
  value: string
  label: string
}

interface TeamsFiltersProps {
  categories: CategoryOption[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

/** Libellés « parents » pour les catégories fédérales, du plus jeune au plus âgé. */
const CATEGORY_LABELS: Record<string, string> = {
  Découverte: 'Baby Hand',
  Départemental: '-13 ans / -11 ans',
  Excellence: '-15 ans',
  Elite: '-18 ans',
  Prénationale: 'Prénationale',
  N2F: 'Nationale 2 Féminine',
  N2M: 'Nationale 2 Masculine',
  Mixte: 'Loisirs',
}

/** Ordre d'affichage : des plus jeunes vers les seniors. */
const CATEGORY_ORDER = [
  'Découverte',
  'Départemental',
  'Excellence',
  'Elite',
  'Prénationale',
  'N2F',
  'N2M',
  'Mixte',
]

export function getCategoryLabel(categorie: string) {
  return CATEGORY_LABELS[categorie] ?? categorie
}

export function buildCategoryOptions(categories: string[]): CategoryOption[] {
  const unique = Array.from(new Set(categories.filter(Boolean)))

  unique.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'fr')
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return unique.map((value) => ({ value, label: getCategoryLabel(value) }))
}

export function TeamsFilters({ categories, activeCategory, onCategoryChange }: TeamsFiltersProps) {
  const shouldReduceMotion = useReducedMotion()
  const options: CategoryOption[] = [{ value: 'all', label: 'Toutes' }, ...categories]

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 shadow-xl mb-8">
      <h3 className="text-lg text-white font-display font-semibold mb-4">Catégories</h3>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Filtrer les équipes par catégorie">
        {options.map((category) => {
          const isActive = activeCategory === category.value
          return (
            <motion.button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              aria-pressed={isActive}
              className={`px-4 py-2 font-medium rounded-lg shadow-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            >
              {category.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
