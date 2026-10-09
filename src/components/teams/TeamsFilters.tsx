'use client'

import { sitePill } from '@/components/site/styles'
import { cn } from '@/lib/utils'
import type { CategoryOption } from './categories'

export type { CategoryOption } from './categories'
export { buildCategoryOptions, getCategoryLabel } from './categories'

interface TeamsFiltersProps {
  categories: CategoryOption[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function TeamsFilters({ categories, activeCategory, onCategoryChange }: TeamsFiltersProps) {
  const options: CategoryOption[] = [{ value: 'all', label: 'Toutes' }, ...categories]

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les équipes par catégorie">
      {options.map((category) => {
        const isActive = activeCategory === category.value
        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onCategoryChange(category.value)}
            aria-pressed={isActive}
            className={sitePill({ active: isActive })}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
