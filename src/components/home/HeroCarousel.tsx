'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { carouselSlide } from '@/lib/animations'
import { normalizeImagePath } from '@/lib/utils'

interface Article {
  id: number
  titre: string
  categorie: string
  image: string
  slug: string
}

interface HeroCarouselProps {
  articles: Article[]
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    ...carouselSlide,
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return prev === articles.length - 1 ? 0 : prev + 1
      } else {
        return prev === 0 ? articles.length - 1 : prev - 1
      }
    })
  }

  if (!articles || articles.length === 0) {
    return null
  }

  const currentArticle = articles[currentIndex]

  return (
    <section className="relative min-h-[600px] h-[calc(100dvh-4rem)] md:h-screen w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image with Filters */}
          <div className="absolute inset-0">
            <Image
              src={normalizeImagePath(currentArticle.image, '/img/articles/default.jpg')}
              alt={currentArticle.titre}
              fill
              className="object-cover brightness-110 contrast-105"
              priority={currentIndex === 0}
            />
            {/* Main gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10" />

            {/* Light effects */}
            <div className="absolute inset-0 z-5 bg-gradient-to-tr from-primary-500/10 via-transparent to-secondary-500/10" />
            <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-b from-primary-500/30 to-transparent z-5" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-primary-500/20 to-transparent z-5" />

            {/* Animated hero light */}
            <div className="hero-light" />
          </div>

          {/* Content with Background Box */}
          <div className="relative h-full flex items-center justify-start z-30 px-6 md:px-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border-l-4 border-primary-500 max-w-3xl"
            >
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xs font-bold text-white mb-2 uppercase"
              >
                {currentArticle.categorie}
              </motion.h4>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-xl"
              >
                {currentArticle.titre}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link
                  href={`/actus/${currentArticle.slug}`}
                  className="inline-flex items-center gap-2 w-40 h-12 bg-primary-500 text-xs font-bold text-center hover:bg-black hover:text-white transition-colors shadow-lg hover:shadow-xl justify-center"
                  aria-label={`Lire l'article: ${currentArticle.titre}`}
                >
                  Lire l'article
                  <span className="text-lg font-black">➞</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Expandable Slider Navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
        <div className="flex justify-center gap-1 bg-black/70 backdrop-blur-sm rounded-full p-1.5 shadow-xl">
          {articles.map((article, index) => (
            <button
              key={article.id}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                index === currentIndex ? 'active' : ''
              }`}
              type="button"
              aria-label={`Article ${index + 1}: ${article.titre}`}
            >
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-500'
                    : 'bg-white group-hover:bg-primary-500'
                }`}
              />
              <div
                className={`slider-content flex-col gap-1 max-w-[260px] transition-all overflow-hidden ${
                  index === currentIndex
                    ? 'flex max-h-20 opacity-100'
                    : 'hidden max-h-0 opacity-0 group-hover:flex group-hover:max-h-20 group-hover:opacity-100'
                }`}
              >
                <span className="text-xs font-medium text-white/80 uppercase">
                  {article.categorie}
                </span>
                <p className="text-sm text-white font-bold line-clamp-2">
                  {article.titre}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
