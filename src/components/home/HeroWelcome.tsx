'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Trophy } from 'lucide-react'

interface HeroWelcomeProps {
  backgroundImage?: string | null
  children?: React.ReactNode
}

export function HeroWelcome({ backgroundImage, children }: HeroWelcomeProps) {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <section className="relative w-full bg-zinc-950 flex items-center overflow-hidden pt-16">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="HBC Aix-en-Savoie"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-zinc-950" />
        </div>
      )}

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column - Identité du club */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center px-4 py-1.5 mb-6 bg-primary-500/15 border border-primary-500/30 rounded-full text-primary-400 text-sm font-semibold uppercase tracking-wide"
            >
              Club de handball depuis 1964
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight"
            >
              Bienvenue au{' '}
              <span className="text-primary-500">HBC Aix-en-Savoie</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed max-w-xl"
            >
              Une solide institution sportive aixoise, passionnée par le handball
              et dédiée à la formation de jeunes talents
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <Link
                href="/contact?sujet=inscription"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Inscrire un joueur
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/equipes"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Découvrir nos équipes
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Matchs (prochains + derniers résultats) */}
          <div className="w-full max-w-md lg:max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="flex items-center gap-2 text-base font-display font-bold text-white uppercase tracking-wide">
                <Trophy className="w-4 h-4 text-primary-500" />
                Nos matchs
              </h2>
              <Link
                href="/equipes"
                className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
              >
                Tout voir
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
