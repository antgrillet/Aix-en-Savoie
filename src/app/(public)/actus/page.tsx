import { prisma } from '@/lib/prisma'
import { ArticlesGrid } from '@/components/news/ArticlesGrid'
import { NewsFilters } from '@/components/news/NewsFilters'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'

export const revalidate = 600

interface SearchParams {
  categorie?: string
  page?: string
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

  return (
    <div className="pt-24 min-h-screen bg-zinc-900 relative overflow-hidden">
      {/* Background */}
      <PageBackground imageUrl={backgroundImage} />

      {/* Header */}
      <section className="py-12 text-white relative overflow-hidden z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
            Nos Actualités
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Suivez toute l'actualité du HBC Aix-en-Savoie
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsFilters
          categories={categories.map((c) => c.categorie)}
          currentCategory={categorie}
        />
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {articles.length > 0 ? (
          <>
            <ArticlesGrid articles={articles} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <a
                      key={pageNum}
                      href={`/actus?${categorie ? `categorie=${categorie}&` : ''}page=${pageNum}`}
                      className={`px-4 py-2 rounded font-mont font-bold transition-colors ${
                        pageNum === page
                          ? 'bg-primary-500 text-white'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {pageNum}
                    </a>
                  )
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg font-mont">
              Aucun article trouvé dans cette catégorie.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
