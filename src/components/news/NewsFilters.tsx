'use client'

import Link from 'next/link'
import { sitePill } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface NewsFiltersProps {
  categories: string[]
  currentCategory?: string
}

export function NewsFilters({
  categories,
  currentCategory,
}: NewsFiltersProps) {
  const allCategories = ['TOUS', ...categories]

  return (
    <nav aria-label="Filtrer par catégorie">
      <ul className="flex flex-wrap gap-2">
        {allCategories.map((cat) => {
          const active = (cat === 'TOUS' && !currentCategory) || cat === currentCategory

          return (
            <li key={cat}>
              <Link
                href={cat === 'TOUS' ? '/actus' : `/actus?categorie=${cat}`}
                aria-current={active ? 'page' : undefined}
                className={cn(sitePill({ active }), 'min-h-10')}
              >
                {/* Catégories stockées en capitales : affichées en minuscules avec initiale */}
                <span className="inline-block lowercase first-letter:uppercase">
                  {cat === 'TOUS' ? 'Toutes' : cat}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
