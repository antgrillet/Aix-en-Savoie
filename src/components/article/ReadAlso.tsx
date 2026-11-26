import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/generated/prisma/client'
import { normalizeImagePath } from '@/lib/utils'
import { formatDateLongue } from '@/lib/dates'
import { SideCard } from './SideCard'

interface ReadAlsoProps {
  articles: Pick<Article, 'id' | 'titre' | 'slug' | 'image' | 'date'>[]
}

/** Carte « Lire aussi » de la colonne latérale. */
export function ReadAlso({ articles }: ReadAlsoProps) {
  if (articles.length === 0) return null

  return (
    <SideCard title="Lire aussi">
      <ul>
        {articles.map((article) => (
          <li key={article.id} className="border-t border-zinc-700/70">
            <Link
              href={`/actus/${article.slug}`}
              className="group grid grid-cols-[96px_1fr] items-center gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
            >
              <div className="relative h-[62px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                  src={normalizeImagePath(article.image)}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <time
                  dateTime={article.date.toISOString()}
                  className="font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400"
                >
                  {formatDateLongue(article.date)}
                </time>
                <h3 className="mt-1 line-clamp-3 font-display text-[15px] font-bold leading-snug text-white transition-colors group-hover:text-primary-400 break-words">
                  {article.titre}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SideCard>
  )
}
