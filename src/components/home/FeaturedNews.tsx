'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface NewsArticle {
  id: number
  slug: string
  titre: string
  categorie: string
  dateLabel: string
  image: string | null
  resume: string | null
}

interface FeaturedNewsProps {
  articles: NewsArticle[]
}

const smoothEase = [0.22, 1, 0.36, 1] as const

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  const reduceMotion = useReducedMotion()

  if (!articles || articles.length === 0) {
    return null
  }

  const [featured, ...rest] = articles

  return (
    <section className="bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="mb-12"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-500">
            {'// La vie du club'}
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
              Dernières actus
            </h2>
            <Link
              href="/actus"
              className="group inline-flex items-center gap-2 self-start font-mono text-sm uppercase tracking-widest text-neutral-400 transition-colors duration-200 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:self-auto"
            >
              Tout voir
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Article à la une : reveal masqué de bas en haut */}
          {featured && (
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: smoothEase }}
            >
              <Link href={`/actus/${featured.slug}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                {/* Le masque suit l'entrée du bloc parent : un élément entièrement
                    masqué par clip-path ne se détecte pas lui-même de façon fiable (mobile). */}
                <motion.div
                  variants={{
                    hidden: { clipPath: 'inset(100% 0 0 0)' },
                    visible: { clipPath: 'inset(0% 0 0 0)' },
                  }}
                  transition={{ duration: 1.1, ease: smoothEase }}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_20px_60px_-20px_rgba(249,115,22,0.25)]"
                >
                  <Image
                    src={featured.image || '/img/articles/default.jpg'}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-primary-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
                    {featured.categorie}
                  </span>
                </motion.div>
                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-neutral-500">
                  À la une · {featured.dateLabel}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white transition-colors duration-200 group-hover:text-primary-400 md:text-3xl">
                  {featured.titre}
                </h3>
                {featured.resume && (
                  <p className="mt-3 line-clamp-3 leading-relaxed text-neutral-400">
                    {featured.resume}
                  </p>
                )}
              </Link>
            </motion.div>
          )}

          {/* Les autres : liste numérotée */}
          <div className="flex flex-col justify-center border-t border-white/10 lg:border-t-0">
            {rest.map((article, i) => (
              <motion.div
                key={article.id}
                initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: reduceMotion ? 0 : i * 0.07,
                  duration: 0.55,
                  ease: smoothEase,
                }}
                className="border-b border-white/10"
              >
                <Link
                  href={`/actus/${article.slug}`}
                  className="group flex items-start gap-5 py-6 transition-[padding] duration-300 hover:pl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                >
                  <span className="mt-1 font-mono text-sm tabular-nums text-neutral-600">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-500">
                      {article.categorie} · {article.dateLabel}
                    </p>
                    <h4 className="mt-1.5 font-display text-lg font-bold leading-snug tracking-tight text-white transition-colors duration-200 group-hover:text-primary-400 md:text-xl">
                      {article.titre}
                    </h4>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="mt-2 h-5 w-5 shrink-0 -translate-x-2 text-primary-500 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
