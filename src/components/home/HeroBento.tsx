'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Trophy, TrendingUp, ExternalLink } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'

interface Article {
  id: number
  titre: string
  categorie: string
  image: string
  slug: string
}

interface HeroBentoProps {
  articles: Article[]
  backgroundImage?: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const imageHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

const cardHoverVariants = {
  rest: {
    y: 0,
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export function HeroBento({ articles, backgroundImage }: HeroBentoProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  const displayArticles = articles.slice(0, 4)

  const upcomingMatch = {
    team1: 'HBC Aix-en-Savoie',
    team2: 'Pontarlier',
    category: 'N2F',
    date: 'SAM 14 DÉC',
    time: '20H45',
    location: 'Gymnase des Prés Riants',
  }

  const lastResult = {
    team1: 'HBC Aix-en-Savoie',
    score1: 28,
    team2: 'Chambéry',
    score2: 24,
    category: 'N2F',
  }

  const featuredPartner = {
    name: 'Partenaire Officiel',
    logo: '/img/partners/partner-placeholder.png',
    url: '#',
  }

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 pt-28 md:pt-32 pb-12">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10 pointer-events-none z-[1]" />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
        >
          {/* Left Side - All Articles */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Featured Article */}
            <motion.article
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              className="md:col-span-2 group"
            >
              <Link href={`/actus/${displayArticles[0].slug}`}>
                <motion.div
                  variants={cardHoverVariants}
                  className="relative h-[400px] rounded-3xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div variants={imageHoverVariants} className="relative w-full h-full">
                      <Image
                        src={normalizeImagePath(displayArticles[0].image, '/img/articles/default.jpg')}
                        alt={displayArticles[0].titre}
                        fill
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <span className="inline-block w-fit px-4 py-2 mb-4 text-xs font-bold tracking-wider uppercase bg-orange-500 text-white rounded-full">
                      {displayArticles[0].categorie}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      {displayArticles[0].titre}
                    </h2>
                    <div className="flex items-center gap-3 text-white font-semibold group-hover:gap-4 transition-all">
                      <span>Lire l'article</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.article>

            {/* Secondary Articles - 3 cards in 2 columns */}
            {displayArticles.slice(1).map((article) => (
              <motion.article
                key={article.id}
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                className="group"
              >
                <Link href={`/actus/${article.slug}`}>
                  <motion.div
                    variants={cardHoverVariants}
                    className="relative h-[320px] rounded-3xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div variants={imageHoverVariants} className="relative w-full h-full">
                        <Image
                          src={normalizeImagePath(article.image, '/img/articles/default.jpg')}
                          alt={article.titre}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="inline-block w-fit px-3 py-1.5 mb-3 text-xs font-bold tracking-wider uppercase bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20">
                        {article.categorie}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-4 leading-tight line-clamp-2">
                        {article.titre}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 font-medium text-sm group-hover:gap-3 transition-all">
                        <span>Lire</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Right Side - Widgets */}
          <div className="space-y-6">
            {/* Upcoming Match */}
            <motion.div variants={cardVariants} initial="rest" whileHover="hover">
              <motion.div variants={cardHoverVariants} className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white font-bold text-sm mb-1">PROCHAIN MATCH</p>
                    <p className="text-white/80 text-xs">{upcomingMatch.category}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-white/80" />
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-lg">HBC</span>
                    </div>
                  </div>
                  <span className="text-white text-2xl font-bold">VS</span>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-sm">{upcomingMatch.team2.substring(0,3).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{upcomingMatch.date} • {upcomingMatch.time}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Last Result */}
            <motion.div variants={cardVariants} initial="rest" whileHover="hover">
              <motion.div variants={cardHoverVariants} className="rounded-3xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm mb-1">DERNIER RÉSULTAT</p>
                    <p className="text-white/60 text-xs">{lastResult.category}</p>
                  </div>
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-500">{lastResult.score1}</div>
                  </div>
                  <div className="text-white/40 text-xl">-</div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white/60">{lastResult.score2}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-green-500 text-sm font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>VICTOIRE</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Featured Partner */}
            <motion.div variants={cardVariants} initial="rest" whileHover="hover">
              <Link href={featuredPartner.url}>
                <motion.div variants={cardHoverVariants} className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center group">
                  <p className="text-white/60 text-xs font-semibold mb-3 uppercase">Partenaire</p>
                  <div className="relative w-24 h-24 mx-auto mb-3 bg-white rounded-2xl p-3">
                    <Image src={featuredPartner.logo} alt={featuredPartner.name} fill className="object-contain" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-white/80 text-xs group-hover:text-orange-500 transition-colors">
                    <span>En savoir plus</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
