import Link from 'next/link'

interface NewsPaginationProps {
  page: number
  totalPages: number
  categorie?: string
}

function pageHref(pageNum: number, categorie?: string): string {
  const params = new URLSearchParams()
  if (categorie && categorie !== 'TOUS') params.set('categorie', categorie)
  if (pageNum > 1) params.set('page', pageNum.toString())
  const query = params.toString()
  return `/actus${query ? `?${query}` : ''}`
}

const base =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
const idle = 'border-white/10 text-neutral-300 hover:border-white/30 hover:text-white'

export function NewsPagination({ page, totalPages, categorie }: NewsPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination des actualités" className="mt-9">
      <ul className="flex flex-wrap items-center justify-center gap-2.5">
        {page > 1 && (
          <li>
            <Link href={pageHref(page - 1, categorie)} className={`${base} ${idle}`}>
              <span aria-hidden>&larr;</span>&nbsp;Page précédente
            </Link>
          </li>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <li key={pageNum}>
            <Link
              href={pageHref(pageNum, categorie)}
              aria-current={pageNum === page ? 'page' : undefined}
              aria-label={`Page ${pageNum}`}
              className={`${base} ${
                pageNum === page
                  ? 'border-primary-500 bg-primary-500 font-extrabold text-zinc-950'
                  : idle
              }`}
            >
              {pageNum}
            </Link>
          </li>
        ))}
        {page < totalPages && (
          <li>
            <Link href={pageHref(page + 1, categorie)} className={`${base} ${idle}`}>
              Page suivante&nbsp;<span aria-hidden>&rarr;</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
