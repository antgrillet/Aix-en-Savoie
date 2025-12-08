'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { cardHover } from '@/lib/animations'
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

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="h-full"
    >
      <Link href={`/actus/${article.slug}`} className="group block h-full">
        <article className="bg-zinc-800/60 rounded-lg overflow-hidden shadow-xl border border-zinc-700 h-full hover:border-primary-500 transition-colors duration-300 flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            <Image
              src={normalizeImagePath(article.image, '/img/articles/default.jpg')}
              alt={article.titre}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold uppercase rounded">
                {article.categorie}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 text-neutral-300 text-sm mb-3">
              <Calendar className="w-4 h-4" />
              <time dateTime={new Date(article.date).toISOString()}>
                {new Date(article.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>

            <h3 className="font-display font-bold text-xl mb-3 text-white group-hover:text-primary-500 transition-colors line-clamp-2">
              {article.titre}
            </h3>

            <p className="text-neutral-300 text-sm line-clamp-3 mb-4 whitespace-pre-line flex-1">
              {article.resume}
            </p>

            <div className="flex items-center text-primary-500 font-semibold text-sm group-hover:gap-2 transition-all mt-auto">
              Lire la suite
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
