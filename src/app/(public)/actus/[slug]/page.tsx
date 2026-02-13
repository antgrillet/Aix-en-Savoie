import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { normalizeImagePath } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'
import { ReadingProgress } from '@/components/article/ReadingProgress'
import { Breadcrumb } from '@/components/article/Breadcrumb'
import { ArticleHero } from '@/components/article/ArticleHero'
import { ShareButtons } from '@/components/article/ShareButtons'
import { ReadAlso } from '@/components/article/ReadAlso'
import { getServerSession } from '@/lib/auth-utils'
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata, SITE_URL } from '@/lib/seo'

export const revalidate = 1800

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
    select: {
      titre: true,
      resume: true,
      image: true,
      slug: true,
      date: true,
    },
  })

  if (!article) {
    return buildMetadata({
      title: 'Article introuvable',
      description: "Cet article n'existe pas ou n'est plus disponible.",
      path: `/actus/${slug}`,
      noindex: true,
    })
  }

  return buildMetadata({
    title: article.titre,
    description: article.resume,
    path: `/actus/${article.slug}`,
    image: normalizeImagePath(article.image, '/img/articles/default.jpg'),
    ogType: 'article',
  })
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const session = await getServerSession()
  const isAdmin = session?.user?.role === 'admin'

  // Récupérer l'article - autoriser les non publiés pour les admins
  const article = await prisma.article.findUnique({
    where: {
      slug,
      ...(isAdmin ? {} : { published: true }),
    },
  })

  if (!article) {
    notFound()
  }

  const similarArticles = await prisma.article.findMany({
    where: {
      published: true,
      categorie: article.categorie,
      NOT: {
        id: article.id,
      },
    },
    take: 5,
    orderBy: {
      date: 'desc',
    },
    select: {
      id: true,
      titre: true,
      slug: true,
      image: true,
      date: true,
      resume: true,
    },
  })

  const readingTime = calculateReadingTime(article.contenu)
  const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/actus/${article.slug}`

  return (
    <>
      <ReadingProgress />
      <ArticleSchema
        title={article.titre}
        description={article.resume}
        image={normalizeImagePath(article.image, '/img/articles/default.jpg')}
        datePublished={article.date}
        dateModified={article.updatedAt}
        slug={article.slug}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Actualités', url: '/actus' },
          { name: article.titre, url: `/actus/${article.slug}` },
        ]}
      />

      {/* Bandeau de prévisualisation pour les brouillons */}
      {!article.published && isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-2 px-4 text-center font-semibold">
          📝 Mode prévisualisation - Cet article n'est pas encore publié
        </div>
      )}

      <div className={`min-h-screen bg-zinc-900 ${!article.published && isAdmin ? 'pt-32' : 'pt-24'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Actualités', href: '/actus' },
                { label: article.categorie, href: `/actus?categorie=${article.categorie}` },
              ]}
              currentPage={article.titre}
            />
          </div>

          <ArticleHero
            title={article.titre}
            categorie={article.categorie}
            date={article.date}
            image={normalizeImagePath(article.image, '/img/articles/default.jpg')}
            views={article.views}
            readingTime={readingTime}
          />

          <ShareButtons title={article.titre} url={articleUrl} />

          <article className="max-w-4xl mx-auto pb-20">
            <div className="max-w-[680px] mx-auto">
              <div className="mb-10 opacity-0 animate-fadeIn">
                <p className="text-xl md:text-2xl text-neutral-300 leading-[1.65] font-serif italic border-l-4 border-primary-500 pl-6 py-4 break-words">
                  {article.resume}
                </p>
              </div>

              <div
                className="prose prose-lg prose-invert max-w-none opacity-0 animate-fadeIn [animation-delay:150ms] break-words
                  [&>*]:text-neutral-300
                  prose-headings:font-display prose-headings:font-bold prose-headings:!text-white prose-headings:mt-10 prose-headings:mb-5
                  prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl
                  prose-p:text-[17px] prose-p:leading-[1.8] prose-p:!text-neutral-300 prose-p:mb-6 prose-p:break-words
                  prose-a:!text-primary-500 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors prose-a:break-all
                  prose-strong:!text-white prose-strong:font-semibold
                  prose-em:!text-neutral-300
                  prose-span:!text-neutral-300
                  prose-img:rounded-lg prose-img:my-10 prose-img:border prose-img:border-zinc-700 prose-img:mx-auto prose-img:block
                  prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:!text-neutral-400 prose-blockquote:my-8
                  prose-ul:!text-neutral-300 prose-ol:!text-neutral-300
                  prose-li:text-[17px] prose-li:leading-[1.8] prose-li:mb-2 prose-li:!text-neutral-300 prose-li:break-words
                  prose-code:!text-primary-400 prose-code:!bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[0.9em] prose-code:break-all
                  prose-pre:!bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:break-words prose-pre:whitespace-pre-wrap
                  [&_*]:!text-neutral-300 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_strong]:!text-white [&_a]:!text-primary-500 [&_img]:mx-auto [&_img]:block"
                dangerouslySetInnerHTML={{ __html: article.contenu }}
              />

              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-zinc-700 opacity-0 animate-fadeIn [animation-delay:300ms]">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-zinc-800/60 text-neutral-400 text-sm rounded border border-zinc-700 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="opacity-0 animate-fadeIn [animation-delay:450ms]">
              <ReadAlso articles={similarArticles} />
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
