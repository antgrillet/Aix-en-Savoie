import Link from 'next/link'
import Image from 'next/image'
import { ANTON, LIEN } from './affiche'
import { normalizeImagePath } from '@/lib/utils'

interface Article {
  id: number
  titre: string
  categorie: string
  date: Date
  image: string
  resume: string
  slug: string
}

interface FeaturedNewsProps {
  articles: Article[]
}

const formatDate = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' })

function Surtitre({ article }: { article: Article }) {
  return (
    <span className="block text-[13px] text-stone-400">
      {article.categorie} · <time dateTime={article.date.toISOString()}>{formatDate.format(article.date)}</time>
    </span>
  )
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#141210]'

/** Un article à la une en grand, les suivants en liste à côté */
export function FeaturedNews({ articles }: FeaturedNewsProps) {
  if (!articles || articles.length === 0) {
    return null
  }
  const [une, ...suivants] = articles

  return (
    <section aria-labelledby="titre-actus" className="bg-[#141210] py-20 text-white md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <h2 id="titre-actus" className={`${ANTON} text-5xl md:text-[72px]`}>
            Actualités
          </h2>
          <Link href="/actus" className={LIEN}>
            Toutes les actualités
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <Link href={`/actus/${une.slug}`} className={`group block rounded ${FOCUS}`}>
            <span className="relative block aspect-video overflow-hidden rounded">
              <Image
                src={normalizeImagePath(une.image, '/img/articles/default.jpg')}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </span>
            <span className="mt-5 block">
              <Surtitre article={une} />
            </span>
            <span className="mt-2 block max-w-2xl font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary-400 md:text-3xl">
              {une.titre}
            </span>
            {une.resume && (
              <span className="mt-3 line-clamp-3 block max-w-2xl whitespace-pre-line leading-relaxed text-stone-300">
                {une.resume}
              </span>
            )}
          </Link>

          {suivants.length > 0 && (
            <ul>
              {suivants.slice(0, 3).map((article) => (
                <li key={article.id} className="border-b border-white/10 py-6 first:pt-0 last:border-b-0">
                  <Link href={`/actus/${article.slug}`} className={`group grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 rounded sm:grid-cols-[8.75rem_minmax(0,1fr)] ${FOCUS}`}>
                    <span className="relative block aspect-square overflow-hidden rounded">
                      <Image
                        src={normalizeImagePath(article.image, '/img/articles/default.jpg')}
                        alt=""
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    </span>
                    <span>
                      <Surtitre article={article} />
                      <span className="mt-1.5 line-clamp-3 block font-display text-lg font-bold leading-snug transition-colors group-hover:text-primary-400">
                        {article.titre}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
