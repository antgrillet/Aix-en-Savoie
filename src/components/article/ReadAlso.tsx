import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import type { Article } from '@prisma/client'
import { normalizeImagePath } from '@/lib/utils'

interface ReadAlsoProps {
  articles: Pick<Article, 'id' | 'titre' | 'slug' | 'image' | 'date' | 'resume'>[]
}

export function ReadAlso({ articles }: ReadAlsoProps) {
  if (articles.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-zinc-700">
      <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-8">
        Lire aussi
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/actus/${article.slug}`}
            className="group"
          >
            <article className="h-full bg-zinc-800/60 rounded-lg overflow-hidden border border-zinc-700 hover:border-primary-500 transition-all duration-300 shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={normalizeImagePath(article.image)}
                  alt={article.titre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-5">
                <time className="text-xs text-neutral-400 font-medium">
                  {format(new Date(article.date), 'dd MMMM yyyy', { locale: fr })}
                </time>

                <h3 className="font-display font-bold text-lg text-white mt-2 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {article.titre}
                </h3>

                <p className="text-sm text-neutral-300 line-clamp-2 mb-4 whitespace-pre-line">
                  {article.resume}
                </p>

                <div className="flex items-center gap-2 text-primary-500 text-sm font-semibold">
                  <span>Lire l'article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
