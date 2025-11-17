'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Trophy, Calendar, Heart, ArrowRight, Sparkles, Newspaper } from 'lucide-react'

interface HeroWelcomeProps {
  backgroundImage?: string | null
  children?: React.ReactNode
  partenaires?: Array<{
    id: number
    nom: string
    logo: string
    site: string | null
  }>
  articles?: Array<{
    id: number
    titre: string
    categorie: string
    date: Date
    image: string
    slug: string
  }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function HeroWelcome({ backgroundImage, children, partenaires = [], articles = [] }: HeroWelcomeProps) {
  const [activeTab, setActiveTab] = useState<'matchs' | 'articles'>('matchs')

  const stats = [
    { label: 'Licenciés', value: '320+', icon: Users },
    { label: 'Équipes', value: '19', icon: Trophy },
    { label: 'Années d\'histoire', value: '60+', icon: Calendar },
    { label: 'Bénévoles', value: '50+', icon: Heart },
  ]

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center overflow-hidden pt-16">
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
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full filter blur-3xl" />
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full text-primary-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Depuis 1964
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Bienvenue au{' '}
            <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 text-transparent bg-clip-text">
              HBC Aix-en-Savoie
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed"
          >
            Une solide institution sportive aixoise, passionnée par le handball
            et dédiée à la formation de jeunes talents
          </motion.p>

          {/* Stats Grid - Plus compact */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-4 gap-3 w-full mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  variants={statsVariants}
                  className="text-center"
                >
                  <Icon className="w-5 h-5 text-primary-500 mb-1 mx-auto" />
                  <div className="text-xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-medium leading-tight">
                    {stat.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <Link
              href="/equipes"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:-translate-y-1 duration-300"
            >
              Découvrir nos équipes
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Partenaires Grid */}
          {partenaires.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="w-full"
            >
              <h3 className="text-sm font-semibold text-neutral-400 mb-4 text-center lg:text-left">
                Nos partenaires principaux
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {partenaires.slice(0, 6).map((partenaire) => (
                  <Link
                    key={partenaire.id}
                    href={partenaire.site || '#'}
                    target={partenaire.site ? '_blank' : undefined}
                    className="aspect-video bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 group relative overflow-hidden"
                  >
                    <Image
                      src={partenaire.logo}
                      alt={partenaire.nom}
                      fill
                      className="object-contain p-1 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      unoptimized
                    />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          </motion.div>

          {/* Right Column - Tabs Widget */}
          <div className="w-full max-w-md lg:max-w-lg mx-auto lg:mx-0">
            {/* Tabs Header */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('matchs')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'matchs'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Matchs</span>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'articles'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span className="text-sm">Actualités</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'matchs' && (
                <div>
                  {children}
                </div>
              )}

              {activeTab === 'articles' && articles.length > 0 && (
                <div className="space-y-3">
                  {articles.slice(0, 4).map((article) => (
                    <Link
                      key={article.id}
                      href={`/actus/${article.slug}`}
                      className="block group"
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300">
                        <div className="flex gap-3 p-3">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={article.image}
                              alt={article.titre}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-primary-400 font-semibold mb-1">
                              {article.categorie}
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
                              {article.titre}
                            </h4>
                            <div className="text-[10px] text-neutral-500">
                              {new Date(article.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
