'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

const cardHoverVariants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export function UpcomingMatches() {
  return (
    <section className="relative w-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 py-16 md:py-20">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
            Nos Équipes
          </h2>
          <div className="w-24 h-1 bg-white/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center items-center gap-4 mb-12"
        >
          <div
            className="flex gap-2 bg-white/20 backdrop-blur-md p-1.5 rounded-xl shadow-lg"
            role="group"
            aria-label="Filtrer les équipes par catégorie"
          >
            <button
              className="py-2.5 px-5 bg-white text-orange-600 rounded-lg font-semibold text-sm transition-all hover:bg-white/90 shadow-md"
              aria-label="Afficher toutes les équipes"
              aria-pressed="true"
            >
              Tous
            </button>
            <button
              className="py-2.5 px-5 text-white rounded-lg font-semibold text-sm transition-all hover:bg-white/20"
              aria-label="Afficher les équipes masculines"
              aria-pressed="false"
            >
              Masculins
            </button>
            <button
              className="py-2.5 px-5 text-white rounded-lg font-semibold text-sm transition-all hover:bg-white/20"
              aria-label="Afficher les équipes féminines"
              aria-pressed="false"
            >
              Féminines
            </button>
          </div>
        </motion.div>

        {/* Carte unique centrée "Découvrir nos équipes" */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
          className="max-w-2xl mx-auto"
        >
          <motion.a
            href="/equipes"
            initial="rest"
            whileHover="hover"
            className="block"
          >
            <motion.div
              variants={cardHoverVariants}
              className="bg-white p-8 md:p-12 rounded-2xl text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-xl shadow-orange-500/30"
              >
                <Users className="w-16 h-16 text-white" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
                Découvrir nos équipes
              </h3>

              <p className="text-zinc-600 text-base md:text-lg mb-6 leading-relaxed">
                Explorez toutes nos équipes, des jeunes aux seniors, et découvrez les valeurs qui nous animent.
              </p>

              <div className="inline-flex items-center gap-2 text-orange-600 font-semibold text-lg group">
                <span>En savoir plus</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
