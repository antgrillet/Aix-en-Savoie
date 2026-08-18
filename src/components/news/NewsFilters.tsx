'use client'

import Link from 'next/link'

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
    <div className="flex flex-wrap justify-center gap-3">
      {allCategories.map((cat) => (
        <Link
          key={cat}
          href={cat === 'TOUS' ? '/actus' : `/actus?categorie=${cat}`}
          aria-current={
            (cat === 'TOUS' && !currentCategory) || cat === currentCategory ? 'page' : undefined
          }
          className={`px-6 py-2.5 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
            (cat === 'TOUS' && !currentCategory) || cat === currentCategory
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-zinc-800/60 text-neutral-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  )
}
