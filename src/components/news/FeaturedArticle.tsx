import Link from 'next/link'
import Image from 'next/image'
import { normalizeImagePath } from '@/lib/utils'
import { formatNewsDate, type NewsArticle } from './types'

interface FeaturedArticleProps {
  article: NewsArticle
  readingTime: number
}

// Article « À la une » de la liste des actus : grande photo à gauche, texte et
// bouton à droite ; empilés sous `lg`.
export function FeaturedArticle({ article, readingTime }: FeaturedArticleProps) {
  return (
    <Link
      href={`/actus/${article.slug}`}
      className="group mb-7 grid overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-colors duration-300 hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800 lg:aspect-auto lg:min-h-[380px]">
        <Image
          src={normalizeImagePath(article.image, '/img/articles/default.jpg')}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-[center_40%] transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <article className="flex flex-col justify-center gap-3.5 p-6 sm:p-8 lg:px-10 lg:py-9">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400">
          À la une · <time dateTime={new Date(article.date).toISOString()}>{formatNewsDate(article.date)}</time>
          {' · '}
          {readingTime} min de lecture
        </p>
        <h2 className="font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-white transition-colors group-hover:text-primary-400 md:text-4xl">
          {article.titre}
        </h2>
        <p className="line-clamp-5 whitespace-pre-line text-base leading-relaxed text-neutral-300 md:text-lg">
          {article.resume}
        </p>
        <span className="mt-1 inline-flex min-h-12 items-center gap-2.5 self-start rounded-full bg-primary-500 px-7 py-3 font-extrabold text-zinc-950 transition-colors group-hover:bg-primary-400">
          Lire l&apos;article
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </span>
      </article>
    </Link>
  )
}
