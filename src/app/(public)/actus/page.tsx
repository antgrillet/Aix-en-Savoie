import { prisma } from '@/lib/prisma'
import { ArticlesGrid } from '@/components/news/ArticlesGrid'
import { NewsFilters } from '@/components/news/NewsFilters'
import { FeaturedArticle } from '@/components/news/FeaturedArticle'
import { NewsPagination } from '@/components/news/NewsPagination'
import { calculateReadingTime } from '@/lib/reading-time'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { lireNumeroPage } from '@/lib/pagination'

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
  const page = lireNumeroPage(params.page)

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

const articleSelect = {
  id: true,
  titre: true,
  categorie: true,
  date: true,
  image: true,
  resume: true,
  slug: true,
} as const

export default async function ActusPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categorie = params.categorie
  const page = lireNumeroPage(params.page)
  const perPage = 12

  // Construire les conditions de filtrage
  const where = {
    published: true,
    ...(categorie && categorie !== 'TOUS' ? { categorie } : {}),
  }

  // « À la une » : l'article vedette le plus récent du filtre, sinon le plus
  // récent. Il est retiré de la grille sur toutes les pages pour ne jamais
  // apparaître deux fois, et n'est affiché qu'en page 1.
  const featuredSelect = { ...articleSelect, contenu: true } as const
  const [vedette, plusRecent, categories, backgroundImage] = await Promise.all([
    prisma.article.findFirst({
      where: { ...where, vedette: true },
      orderBy: { date: 'desc' },
      select: featuredSelect,
    }),
    prisma.article.findFirst({
      where,
      orderBy: { date: 'desc' },
      select: featuredSelect,
    }),
    // Toutes les catégories disponibles
    prisma.article.findMany({
      where: { published: true },
      select: { categorie: true },
      distinct: ['categorie'],
      orderBy: { categorie: 'asc' },
    }),
    getPageBackgroundImage('actus'),
  ])
  const featured = vedette ?? plusRecent

  const gridWhere = featured ? { ...where, id: { not: featured.id } } : where
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: gridWhere,
      orderBy: { date: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: articleSelect,
    }),
    prisma.article.count({ where: gridWhere }),
  ])

  const totalPages = Math.ceil(total / perPage)
  const showFeatured = Boolean(featured) && page === 1

  return (
    <div className="pt-24 min-h-screen bg-zinc-900 relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Actualités', url: '/actus' },
        ]}
      />
      {/* Background */}
      <PageBackground imageUrl={backgroundImage} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 md:pt-11 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
            Nos Actualités
          </h1>
          <p className="text-base text-neutral-300 md:text-lg">
            Suivez toute l&apos;actualité du HBC Aix-en-Savoie
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8">
          <NewsFilters
            categories={categories.map((c) => c.categorie)}
            currentCategory={categorie}
          />
        </div>

        {showFeatured && featured && (
          <FeaturedArticle
            article={featured}
            readingTime={calculateReadingTime(featured.contenu)}
          />
        )}

        {articles.length > 0 ? (
          <section aria-labelledby="actus-liste">
            <h2 id="actus-liste" className="sr-only">
              {showFeatured ? 'Autres actualités' : 'Actualités'}
            </h2>
            <ArticlesGrid articles={articles} />
          </section>
        ) : (
          !showFeatured && (
            <div className="py-20 text-center">
              <p className="font-display text-lg text-neutral-400">
                {page > 1
                  ? 'Cette page ne contient aucun article.'
                  : 'Aucun article trouvé dans cette catégorie.'}
              </p>
            </div>
          )
        )}

        <NewsPagination page={page} totalPages={totalPages} categorie={categorie} />
      </div>
    </div>
  )
}
