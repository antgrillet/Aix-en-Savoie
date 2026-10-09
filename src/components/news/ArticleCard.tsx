import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { normalizeImagePath, cn } from '@/lib/utils'

interface Article {
  id: number
  titre: string
  categorie: string
  date: Date
  image: string
  resume: string
  slug: string
}

interface ArticleCardProps {
  article: Article
  /** Variante mise en avant : image pleine hauteur, titre en surimpression */
  featured?: boolean
  className?: string
}

export function formatArticleDate(date: Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

export function ArticleCard({ article, featured = false, className }: ArticleCardProps) {
  const image = normalizeImagePath(article.image, '/img/articles/default.jpg')

  if (featured) {
    return (
      <Link
        href={`/actus/${article.slug}`}
        className={cn(
          'group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-xl border border-white/10 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:p-8',
          className
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        <span className="mb-4 w-fit rounded-sm bg-primary-500 px-2 py-1 font-eyebrow text-[0.65rem] text-neutral-950">
          {article.categorie}
        </span>
        <h3 className="max-w-2xl font-headline text-3xl text-white transition-colors group-hover:text-primary-300 sm:text-4xl lg:text-5xl">
          {article.titre}
        </h3>
        <p className="mt-3 line-clamp-2 max-w-2xl text-neutral-300">{article.resume}</p>
        <p className="mt-5 flex items-center gap-4 text-sm text-neutral-400">
          <time dateTime={new Date(article.date).toISOString()}>{formatArticleDate(article.date)}</time>
          <span className="inline-flex items-center gap-1 font-semibold text-primary-400">
            Lire l&apos;article
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </p>
      </Link>
    )
  }

  // Mobile : format horizontal compact ; à partir de sm : carte verticale
  return (
    <Link
      href={`/actus/${article.slug}`}
      className={cn(
        'group flex h-full gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950 sm:flex-col sm:gap-0',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900 sm:aspect-[16/10] sm:w-full sm:rounded-xl">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 hidden rounded-sm bg-neutral-950/80 px-2 py-1 font-eyebrow text-[0.65rem] text-primary-300 backdrop-blur sm:block">
          {article.categorie}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col sm:pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          <span className="text-primary-400 sm:hidden">{article.categorie} · </span>
          <time dateTime={new Date(article.date).toISOString()}>{formatArticleDate(article.date)}</time>
        </p>
        <h3 className="mt-1.5 line-clamp-3 font-display text-base font-bold leading-snug text-white transition-colors group-hover:text-primary-400 sm:mt-2 sm:line-clamp-2 sm:text-lg">
          {article.titre}
        </h3>
        <p className="mt-2 hidden text-sm text-neutral-400 sm:line-clamp-2">{article.resume}</p>
      </div>
    </Link>
  )
}
