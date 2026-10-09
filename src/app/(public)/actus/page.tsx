import Link from 'next/link'
import { ArrowLeft, ArrowRight, Newspaper } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ArticlesGrid } from '@/components/news/ArticlesGrid'
import { NewsFilters } from '@/components/news/NewsFilters'
import { PageHero } from '@/components/site/PageHero'
import { container, siteButton } from '@/components/site/styles'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const revalidate = 600

interface SearchParams {
  categorie?: string
  page?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categorie = params.categorie
  const page = parseInt(params.page || '1')

  const hasFilter = Boolean(categorie && categorie !== 'TOUS')
  const hasPagination = page > 1
  const titleParts = ['Actualités']
  if (hasFilter) titleParts.push(categorie as string)
  if (hasPagination) titleParts.push(`Page ${page}`)

  const queryParams = new URLSearchParams()
  if (hasFilter) queryParams.set('categorie', categorie as string)
  if (hasPagination) queryParams.set('page', page.toString())
  const queryString = queryParams.toString()
  const canonicalPath = `/actus${queryString ? `?${queryString}` : ''}`

  return buildMetadata({
    title: titleParts.join(' - '),
    description: "Suivez toute l'actualité du HBC Aix-en-Savoie.",
    path: canonicalPath,
    noindex: hasFilter || hasPagination,
  })
}

export default async function ActusPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categorie = params.categorie
  const page = parseInt(params.page || '1')
  const perPage = 12

  // Construire les conditions de filtrage
  const where = {
    published: true,
    ...(categorie && categorie !== 'TOUS' ? { categorie } : {}),
  }

  // Récupérer les articles
  const [articles, total, backgroundImage] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        titre: true,
        categorie: true,
        date: true,
        image: true,
        resume: true,
        slug: true,
      },
    }),
    prisma.article.count({ where }),
    getPageBackgroundImage('actus'),
  ])

  // Récupérer toutes les catégories disponibles
  const categories = await prisma.article.findMany({
    where: { published: true },
    select: { categorie: true },
    distinct: ['categorie'],
  })

  const totalPages = Math.ceil(total / perPage)
  const hasFilter = Boolean(categorie && categorie !== 'TOUS')

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Actualités', url: '/actus' },
        ]}
      />

      <PageHero
        eyebrow="Actualités"
        title="La vie du club"
        description="Résultats, événements, stages et vie associative : suivez toute l'actualité du HBC Aix-en-Savoie."
        backgroundImage={backgroundImage}
      />

      <section className="py-16 md:py-24">
        <div className={container}>
          {/* Filtres par catégorie */}
          <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:mb-12 md:flex-row md:items-center md:justify-between">
            <NewsFilters
              categories={categories.map((c) => c.categorie)}
              currentCategory={categorie}
            />
            {total > 0 && (
              <p className="shrink-0 text-sm text-neutral-500">
                {total} article{total > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {articles.length > 0 ? (
            <>
              <ArticlesGrid articles={articles} />

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} categorie={categorie} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-white/15 px-6 py-16 text-center md:py-20">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/5 text-primary-400">
                <Newspaper className="size-6" aria-hidden />
              </span>
              <h2 className="mt-6 font-display text-xl font-bold text-white">Aucun article trouvé</h2>
              <p className="mt-2 max-w-md text-neutral-400">
                {total > 0
                  ? 'Cette page ne contient aucun article.'
                  : hasFilter
                    ? "Aucun article n'a encore été publié dans cette catégorie."
                    : 'Aucune actualité à afficher pour le moment. Revenez bientôt !'}
              </p>
              {(hasFilter || page > 1) && (
                <Link href="/actus" className={cn(siteButton({ variant: 'outline' }), 'mt-8')}>
                  Voir toutes les actualités
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

/* ================================
 * Pagination
 * ================================ */

function pageHref(pageNum: number, categorie?: string) {
  const query = new URLSearchParams()
  if (categorie) query.set('categorie', categorie)
  if (pageNum > 1) query.set('page', pageNum.toString())
  const queryString = query.toString()
  return `/actus${queryString ? `?${queryString}` : ''}`
}

/** Numéros à afficher : premières/dernières pages, voisines de la page courante, points de suspension */
function getPageItems(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set([1, totalPages, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (current >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p))

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const items: (number | 'ellipsis')[] = []
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) items.push('ellipsis')
    items.push(p)
  })
  return items
}

const pageLinkClass =
  'inline-flex size-11 items-center justify-center rounded-md font-display text-sm font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'

function Pagination({
  page,
  totalPages,
  categorie,
}: {
  page: number
  totalPages: number
  categorie?: string
}) {
  const hasPrevious = page > 1
  const hasNext = page < totalPages
  const disabledClass = 'pointer-events-none opacity-40'

  return (
    <nav
      aria-label="Pagination des actualités"
      className="mt-16 flex items-center justify-between gap-4 border-t border-white/10 pt-8"
    >
      {hasPrevious ? (
        <Link href={pageHref(page - 1, categorie)} rel="prev" className={cn(siteButton({ variant: 'outline' }), 'group px-4 sm:px-6')}>
          <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Précédent</span>
          <span className="sr-only sm:hidden">Page précédente</span>
        </Link>
      ) : (
        <span aria-hidden className={cn(siteButton({ variant: 'outline' }), disabledClass, 'px-4 sm:px-6')}>
          <ArrowLeft />
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      <ol className="hidden items-center gap-1 sm:flex">
        {getPageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden className="w-8 text-center text-neutral-500">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={pageHref(item, categorie)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  pageLinkClass,
                  item === page
                    ? 'bg-primary-500 text-neutral-950'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ol>

      <p className="text-sm text-neutral-400 sm:hidden">
        Page <span className="font-semibold text-white">{page}</span> sur {totalPages}
      </p>

      {hasNext ? (
        <Link href={pageHref(page + 1, categorie)} rel="next" className={cn(siteButton({ variant: 'outline' }), 'group px-4 sm:px-6')}>
          <span className="hidden sm:inline">Suivant</span>
          <span className="sr-only sm:hidden">Page suivante</span>
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span aria-hidden className={cn(siteButton({ variant: 'outline' }), disabledClass, 'px-4 sm:px-6')}>
          <span className="hidden sm:inline">Suivant</span>
          <ArrowRight />
        </span>
      )}
    </nav>
  )
}
