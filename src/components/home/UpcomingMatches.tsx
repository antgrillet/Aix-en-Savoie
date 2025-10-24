'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import Image from 'next/image'

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  logoAdversaire: string | null
}

interface Team {
  id: number
  nom: string
  categorie: string
  genre: string
  photo: string | null
  featured: boolean
  matchs: Match[]
}

interface UpcomingMatchesProps {
  teams: Team[]
}

type FilterType = 'featured' | 'masculin' | 'feminin'

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

export function UpcomingMatches({ teams }: UpcomingMatchesProps) {
  const [filter, setFilter] = useState<FilterType>('featured')

  // Séparer les équipes featured
  const flagshipTeams = teams.filter(team => team.featured)

  // Toutes les équipes par genre
  const masculinTeams = teams.filter(team => team.genre === 'MASCULIN')
  const femininTeams = teams.filter(team => team.genre === 'FEMININ')

  // Déterminer quelles équipes afficher selon le filtre
  const displayedTeams = filter === 'featured'
    ? flagshipTeams
    : filter === 'masculin'
    ? masculinTeams
    : femininTeams

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).toUpperCase()
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).replace(':', 'H')
  }

  if (teams.length === 0) {
    return null
  }

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
            Matchs du Week-end
          </h2>
          <div className="w-24 h-1 bg-white/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Filtres */}
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
              onClick={() => setFilter('featured')}
              className={`py-2.5 px-5 rounded-lg font-semibold text-sm transition-all ${
                filter === 'featured'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Afficher les équipes à la une"
              aria-pressed={filter === 'featured'}
            >
              À la Une
            </button>
            <button
              onClick={() => setFilter('masculin')}
              className={`py-2.5 px-5 rounded-lg font-semibold text-sm transition-all ${
                filter === 'masculin'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Afficher les équipes masculines"
              aria-pressed={filter === 'masculin'}
            >
              Masculins
            </button>
            <button
              onClick={() => setFilter('feminin')}
              className={`py-2.5 px-5 rounded-lg font-semibold text-sm transition-all ${
                filter === 'feminin'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Afficher les équipes féminines"
              aria-pressed={filter === 'feminin'}
            >
              Féminines
            </button>
          </div>
        </motion.div>

        {/* Contenu selon le filtre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {displayedTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTeams.map((team) => (
                team.matchs[0] && (
                  <FeaturedMatchCard
                    key={team.id}
                    team={team}
                    match={team.matchs[0]}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center text-white/80 py-12">
              <p className="text-lg">Aucun match ce week-end pour cette catégorie</p>
            </div>
          )}
        </motion.div>

        {/* Lien vers toutes les équipes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-16"
        >
          <a
            href="/equipes"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <span>Découvrir toutes nos équipes</span>
            <svg
              className="w-5 h-5"
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
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// Carte pour les équipes fanions
function FeaturedMatchCard({
  team,
  match,
  formatDate,
  formatTime
}: {
  team: Team
  match: Match
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
}) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHoverVariants}
      className="bg-white rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-zinc-900 text-lg">{team.nom}</h4>
          <p className="text-sm text-zinc-500">{team.categorie}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          match.domicile
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {match.domicile ? 'DOMICILE' : 'EXTÉRIEUR'}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 my-6">
        {/* Logo HBC */}
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2 p-2 relative overflow-hidden">
            <Image
              src="/img/home/logo.png"
              alt="HBC Aix-en-Savoie"
              fill
              className="object-contain p-2"
            />
          </div>
          <p className="text-xs text-zinc-600 font-semibold">HBC</p>
        </div>

        <span className="text-2xl font-bold text-zinc-400">VS</span>

        {/* Logo Adversaire */}
        <div className="text-center">
          {match.logoAdversaire ? (
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2 p-2 relative overflow-hidden">
              <Image
                src={match.logoAdversaire}
                alt={match.adversaire}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-orange-600 font-bold text-xs text-center px-2">
                {match.adversaire.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          <p className="text-xs text-zinc-600 font-semibold max-w-[80px] truncate">
            {match.adversaire}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="font-semibold">
            {formatDate(match.date)} • {formatTime(match.date)}
          </span>
        </div>
        {match.domicile && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>{match.lieu}</span>
          </div>
        )}
        {match.competition && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span>{match.competition}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

