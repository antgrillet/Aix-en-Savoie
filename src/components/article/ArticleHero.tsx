import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye } from 'lucide-react'
import { formatArticleDate } from '@/components/news/ArticleCard'
import { container } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface ArticleHeroProps {
  title: string
  categorie: string
  date: Date
  image: string
  views: number
  readingTime: number
  /** Chapô affiché sous le titre */
  resume?: string
  /** Contenu placé au-dessus du titre (fil d'ariane, bandeau de prévisualisation) */
  header?: React.ReactNode
}

/**
 * En-tête éditorial d'un article : texte sur fond sombre (lisibilité),
 * puis grande image de une.
 */
export function ArticleHero({
  title,
  categorie,
  date,
  image,
  views,
  readingTime,
  resume,
  header,
}: ArticleHeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-neutral-950">
      {/* Ambiance : image de une très atténuée derrière le titre */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[34rem] [mask-image:linear-gradient(to_bottom,black_55%,transparent)] md:h-[40rem]"
      >
        <Image src={image} alt="" fill sizes="33vw" className="scale-110 object-cover opacity-25 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
        <div className="absolute inset-0 bg-stripes" />
      </div>

      <div className={cn(container, 'pt-28 md:pt-36')}>
        <div className="mx-auto max-w-5xl">
          {header}

          <Link
            href={`/actus?categorie=${categorie}`}
            className="inline-flex rounded-sm bg-primary-500 px-2 py-1 font-eyebrow text-[0.7rem] text-neutral-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            {categorie}
          </Link>

          <h1 className="mt-5 max-w-4xl font-headline text-[2.6rem] text-white sm:text-6xl lg:text-7xl">{title}</h1>

          {resume && (
            <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-neutral-300 md:text-xl">
              {resume}
            </p>
          )}

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <Calendar aria-hidden className="size-4 text-primary-500" />
              <time dateTime={new Date(date).toISOString()}>{formatArticleDate(date)}</time>
            </li>
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="size-4 text-primary-500" />
              {readingTime} min de lecture
            </li>
            <li className="flex items-center gap-2">
              <Eye aria-hidden className="size-4 text-primary-500" />
              {views} {views > 1 ? 'vues' : 'vue'}
            </li>
          </ul>
        </div>

        <figure className="relative mx-auto mt-10 aspect-[16/10] max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-neutral-900 sm:aspect-[16/9] md:mt-12">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
          />
        </figure>
      </div>
    </header>
  )
}
