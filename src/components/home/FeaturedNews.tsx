'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
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

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-zinc-900 overflow-hidden relative">
      {/* Motif graphique discret */}
      <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={shouldReduceMotion ? undefined : fadeInUp}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 relative inline-block">
            Nos Actualités
            <span className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-primary-500 to-transparent" />
          </h2>
          <p className="text-neutral-400 max-w-2xl mt-6">
            Découvrez les dernières actualités et événements du HBC Aix-en-Savoie
          </p>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              variants={shouldReduceMotion ? undefined : staggerItem}
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
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={article.date.toISOString()}>
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

                    <div className="flex items-center text-primary-500 font-semibold text-sm mt-auto">
                      Lire la suite
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/actus"
            className="inline-flex items-center px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Toutes les actualités
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
