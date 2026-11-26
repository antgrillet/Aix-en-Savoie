import Link from 'next/link'
import Image from 'next/image'
import { normalizeImagePath } from '@/lib/utils'
import { formatNewsDate, type NewsArticle } from './types'

interface ArticleCardProps {
  article: NewsArticle
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/actus/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-colors duration-300 hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
    >
      <article className="flex h-full flex-col">
        <div className="relative h-[200px] shrink-0 overflow-hidden bg-zinc-800">
          <Image
            src={normalizeImagePath(article.image, '/img/articles/default.jpg')}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="absolute left-3.5 top-3.5 rounded-full bg-primary-500 px-3.5 py-1 text-[13px] font-extrabold uppercase leading-normal tracking-[0.02em] text-zinc-950">
            {article.categorie}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-[18px]">
          <time
            dateTime={new Date(article.date).toISOString()}
            className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400"
          >
            {formatNewsDate(article.date)}
          </time>

          <h3 className="my-2 font-display text-[21px] font-extrabold leading-tight tracking-[-0.015em] text-white transition-colors group-hover:text-primary-400">
            {article.titre}
          </h3>

          <p className="mb-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
            {article.resume}
          </p>

          <span className="mt-auto text-sm font-bold text-primary-400">
            Lire la suite{' '}
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            >
              &rarr;
            </span>
          </span>
        </div>
      </article>
    </Link>
  )
}
