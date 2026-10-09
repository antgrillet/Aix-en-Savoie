import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, EyeOff } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn, normalizeImagePath } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'
import { ReadingProgress } from '@/components/article/ReadingProgress'
import { Breadcrumb } from '@/components/article/Breadcrumb'
import { ArticleHero } from '@/components/article/ArticleHero'
import { ShareButtons } from '@/components/article/ShareButtons'
import { ReadAlso } from '@/components/article/ReadAlso'
import { container, siteButton } from '@/components/site/styles'
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
  const image = normalizeImagePath(article.image, '/img/articles/default.jpg')

  return (
    <>
      <ReadingProgress />
      <ArticleSchema
        title={article.titre}
        description={article.resume}
        image={image}
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

      <article>
        <ArticleHero
          title={article.titre}
          categorie={article.categorie}
          date={article.date}
          image={image}
          views={article.views}
          readingTime={readingTime}
          resume={article.resume}
          header={
            <>
              {/* Bandeau de prévisualisation pour les brouillons */}
              {!article.published && isAdmin && (
                <p
                  role="status"
                  className="mb-6 flex items-start gap-3 rounded-md border border-primary-500/40 bg-primary-500/10 px-4 py-3 text-sm font-medium text-primary-200"
                >
                  <EyeOff aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-400" />
                  Mode prévisualisation : cet article n&apos;est pas encore publié.
                </p>
              )}
              <Breadcrumb
                className="mb-8"
                items={[
                  { label: 'Accueil', href: '/' },
                  { label: 'Actualités', href: '/actus' },
                  { label: categoryLabel(article.categorie), href: `/actus?categorie=${article.categorie}` },
                ]}
                currentPage={article.titre}
              />
            </>
          }
        />

        <div className={cn(container, 'py-12 md:py-16')}>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,40rem)_minmax(0,1fr)] lg:gap-16">
            <div className="min-w-0">
              <div className={articleBodyClass} dangerouslySetInnerHTML={{ __html: article.contenu }} />

              <footer className="mt-14 space-y-8 border-t border-white/10 pt-8">
                {article.tags && article.tags.length > 0 && (
                  <ul aria-label="Mots-clés" className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-neutral-400"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/actus" className={cn(siteButton({ variant: 'link' }), 'group min-h-10 self-start sm:self-auto')}>
                    <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
                    Toutes les actualités
                  </Link>
                  <ShareButtons title={article.titre} url={articleUrl} className="lg:hidden" />
                </div>
              </footer>
            </div>

            {/* Partage, collant pendant la lecture (grand écran) */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 border-l border-white/10 pl-8">
                <ShareButtons title={article.titre} url={articleUrl} layout="stacked" />
              </div>
            </aside>
          </div>
        </div>
      </article>

      <ReadAlso articles={similarArticles} categorie={article.categorie} />
    </>
  )
}

/** « ÉQUIPES » → « Équipes » pour le fil d'ariane */
function categoryLabel(categorie: string) {
  return categorie.charAt(0).toUpperCase() + categorie.slice(1).toLowerCase()
}

/**
 * Contenu riche de l'éditeur (TipTap) mis en forme pour la lecture sur fond sombre.
 * Les règles de base (listes, marges) viennent de `.article-content` dans styles.css,
 * non « layered » : il faut `!` pour les surcharger.
 */
const articleBodyClass = [
  'article-content article-content-invert break-words text-[1.0625rem] leading-[1.8] text-neutral-300 md:text-lg',
  // Neutralise les couleurs en ligne d'anciens contenus collés (illisibles sur fond sombre)
  '[&_*]:![color:inherit]',
  '[&>:first-child]:!mt-0',
  // Paragraphes aérés ; les paragraphes vides servent de saut de ligne
  '[&>p]:!my-[1.15em] [&>p:empty]:!my-0 [&>p:has(>br:only-child)]:!my-0',
  // Intertitres
  '[&_h1]:mb-[0.6em] [&_h1]:mt-[1.5em] [&_h1]:font-headline [&_h1]:text-3xl [&_h1]:!text-white md:[&_h1]:text-4xl',
  '[&_h2]:font-headline [&_h2]:text-3xl [&_h2]:!text-white md:[&_h2]:text-4xl',
  '[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:!text-white md:[&_h3]:text-2xl',
  '[&_h4]:mb-3 [&_h4]:mt-8 [&_h4]:font-display [&_h4]:text-lg [&_h4]:font-bold [&_h4]:!text-white',
  // Emphase
  '[&_b]:!text-white [&_strong]:font-semibold [&_strong]:!text-white',
  // Liens orange
  '[&_a]:font-medium [&_a]:!text-primary-400 [&_a]:underline [&_a]:decoration-primary-400/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:!text-primary-300 [&_a:hover]:decoration-primary-300',
  // Citations
  '[&_blockquote]:!my-10 [&_blockquote]:!pl-6 [&_blockquote]:font-display [&_blockquote]:text-xl [&_blockquote]:font-semibold [&_blockquote]:leading-snug [&_blockquote]:!text-white md:[&_blockquote]:text-2xl',
  '[&_blockquote>p:first-child]:!mt-0 [&_blockquote>p:last-child]:!mb-0',
  // Images (insérées dans un paragraphe ou dans une figure)
  '[&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10',
  '[&>img]:my-10 [&_figure]:my-10 [&_p>img]:my-8',
  '[&_figcaption]:mt-3 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:!text-neutral-500',
  // Séparateur et code
  '[&_hr]:my-12 [&_hr]:border-white/10',
  '[&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:!text-primary-300',
  '[&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-neutral-900 [&_pre]:p-5 [&_pre]:text-sm',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
].join(' ')
