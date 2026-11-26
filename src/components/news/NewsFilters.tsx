import Link from 'next/link'

interface NewsFiltersProps {
  categories: string[]
  currentCategory?: string
}

export function NewsFilters({ categories, currentCategory }: NewsFiltersProps) {
  const active = currentCategory && currentCategory !== 'TOUS' ? currentCategory : 'TOUS'
  const allCategories = ['TOUS', ...categories]

  return (
    <nav aria-label="Filtrer les actualités par thème">
      <ul className="flex flex-wrap items-center justify-center gap-2.5">
        {allCategories.map((cat) => {
          const isActive = cat === active
          return (
            <li key={cat}>
              <Link
                href={cat === 'TOUS' ? '/actus' : `/actus?categorie=${encodeURIComponent(cat)}`}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-[18px] font-mono text-sm uppercase tracking-[0.07em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
                  isActive
                    ? 'border-primary-500 bg-primary-500 font-bold text-zinc-950'
                    : 'border-white/20 text-neutral-300 hover:border-white/40 hover:text-white'
                }`}
              >
                {cat === 'TOUS' ? 'Tous' : cat}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
