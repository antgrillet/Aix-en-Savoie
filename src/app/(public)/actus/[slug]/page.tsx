import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { normalizeImagePath } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'
import { assainirHtml } from '@/lib/html'
import { ReadingProgress } from '@/components/article/ReadingProgress'
import { Breadcrumb } from '@/components/article/Breadcrumb'
import { ArticleHero } from '@/components/article/ArticleHero'
import { ShareButtons } from '@/components/article/ShareButtons'
import { ReadAlso } from '@/components/article/ReadAlso'
import { ArticleContext, type EquipeContexte } from '@/components/article/ArticleContext'
import { trouverEquipeLiee } from '@/components/article/equipe-liee'
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

  const articleSelect = {
    id: true,
    titre: true,
    slug: true,
    image: true,
    date: true,
  } as const

  const [similarArticles, equipes] = await Promise.all([
    prisma.article.findMany({
      where: {
        published: true,
        categorie: article.categorie,
        NOT: { id: article.id },
      },
      take: 3,
      orderBy: { date: 'desc' },
      select: articleSelect,
    }),
    prisma.equipe.findMany({
      where: { published: true },
      orderBy: { ordre: 'asc' },
      select: { id: true, nom: true, categorie: true, slug: true },
    }),
  ])

  // « Lire aussi » : même catégorie d'abord, complété par les derniers articles
  const lireAussi =
    similarArticles.length >= 3
      ? similarArticles
      : [
          ...similarArticles,
          ...(await prisma.article.findMany({
            where: {
              published: true,
              id: { notIn: [article.id, ...similarArticles.map((a) => a.id)] },
            },
            take: 3 - similarArticles.length,
            orderBy: { date: 'desc' },
            select: articleSelect,
          })),
        ]

  // Équipe dont parle l'article (déduite du titre et des tags) et son prochain match
  const equipeLiee = trouverEquipeLiee(article, equipes)
  let equipe: EquipeContexte | null = null
  if (equipeLiee) {
    const [classement, prochainMatch] = await Promise.all([
      prisma.classement.findMany({
        where: { equipeId: equipeLiee.id },
        select: { club: true, position: true },
      }),
      prisma.match.findFirst({
        where: {
          equipeId: equipeLiee.id,
          published: true,
          termine: false,
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        select: { adversaire: true, date: true, domicile: true },
      }),
    ])
    const notreLigne = classement.find((ligne) => {
      const club = ligne.club.toUpperCase()
      return club.includes('HBC AIX') || club.includes('AIX EN SAVOIE')
    })
    equipe = {
      nom: equipeLiee.nom,
      slug: equipeLiee.slug,
      categorie: equipeLiee.categorie,
      position: notreLigne?.position ?? null,
      prochainMatch,
    }
  }

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

      <div className={`min-h-screen bg-zinc-900 pb-20 ${!article.published && isAdmin ? 'pt-32' : 'pt-28 md:pt-36'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Actualités', href: '/actus' },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="min-w-0 opacity-0 animate-fadeIn">
              <ArticleHero
                title={article.titre}
                categorie={article.categorie}
                date={article.date}
                image={normalizeImagePath(article.image, '/img/articles/default.jpg')}
                readingTime={readingTime}
              />

              <p className="mb-6 whitespace-pre-line text-lg font-medium leading-[1.55] text-white break-words md:text-[22px]">
                {article.resume}
              </p>

              <div
                className="article-content article-content-invert prose prose-lg prose-invert max-w-none opacity-0 animate-fadeIn [animation-delay:150ms] break-words
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
                  prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-6 prose-ol:pl-6
                  prose-ul:!text-neutral-300 prose-ol:!text-neutral-300
                  prose-li:text-[17px] prose-li:leading-[1.8] prose-li:mb-2 prose-li:!text-neutral-300 prose-li:break-words
                  prose-code:!text-primary-400 prose-code:!bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[0.9em] prose-code:break-all
                  prose-pre:!bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:break-words prose-pre:whitespace-pre-wrap
                  [&_*]:!text-neutral-300 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_strong]:!text-white [&_a]:!text-primary-500 [&_img]:mx-auto [&_img]:block"
                dangerouslySetInnerHTML={{ __html: assainirHtml(article.contenu) }}
              />

              <footer className="mt-8 flex flex-col gap-4">
                {article.tags && article.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Mots-clés">
                    {article.tags.map((tag) => (
                      <li key={tag} className="font-mono text-xs text-primary-400">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}
                <ShareButtons url={articleUrl} />
              </footer>
            </article>

            <aside
              aria-label="Autour de cet article"
              className="flex min-w-0 flex-col gap-5 opacity-0 animate-fadeIn [animation-delay:150ms]"
            >
              <ArticleContext date={article.date} equipe={equipe} />
              <ReadAlso articles={lireAussi} />
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
