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
          className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
            (cat === 'TOUS' && !currentCategory) || cat === currentCategory
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
              : 'bg-zinc-800/60 text-neutral-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  )
}
