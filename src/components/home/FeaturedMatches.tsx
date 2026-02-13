'use client'

import { Calendar, Trophy, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
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
  equipe: {
    nom: string
    categorie: string
  }
}

interface FeaturedMatchesProps {
  upcomingMatches: Match[]
  lastResults: Match[]
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function FeaturedMatches({ upcomingMatches, lastResults }: FeaturedMatchesProps) {
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

  const renderMatchCard = (match: Match, isUpcoming: boolean) => {
    const isWin = !isUpcoming && match.scoreEquipe !== null && match.scoreAdversaire !== null && match.scoreEquipe > match.scoreAdversaire
    const isLoss = !isUpcoming && match.scoreEquipe !== null && match.scoreAdversaire !== null && match.scoreEquipe < match.scoreAdversaire
    const homeTeam = match.domicile
      ? { name: match.equipe.nom, logo: '/img/home/logo.png', isHbc: true }
      : { name: match.adversaire, logo: match.logoAdversaire, isHbc: false }
    const awayTeam = match.domicile
      ? { name: match.adversaire, logo: match.logoAdversaire, isHbc: false }
      : { name: match.equipe.nom, logo: '/img/home/logo.png', isHbc: true }

    const renderTeamLogo = (team: { name: string; logo: string | null; isHbc: boolean }) => {
      if (team.logo) {
        return (
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-2 p-2 relative overflow-hidden">
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain p-2"
              unoptimized={!team.isHbc}
            />
          </div>
        )
      }

      return (
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
          <span className="text-white font-bold text-xs text-center px-1">
            {team.name.substring(0, 3).toUpperCase()}
          </span>
        </div>
      )
    }

    return (
      <motion.div variants={cardVariants} initial="rest" whileHover="hover" className="h-full">
        <div className={`rounded-2xl p-5 shadow-xl h-full flex flex-col ${
          isUpcoming
            ? 'bg-gradient-to-br from-primary-500 to-primary-600'
            : 'bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-sm mb-1">
                {isUpcoming ? 'PROCHAIN MATCH' : 'DERNIER RÉSULTAT'}
              </p>
              <p className={`text-xs ${isUpcoming ? 'text-white/80' : 'text-white/60'}`}>
                {match.equipe.categorie}
              </p>
            </div>
            {isUpcoming ? (
              <Calendar className="w-5 h-5 text-white/80" />
            ) : (
              <Trophy className={`w-5 h-5 ${isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-yellow-500'}`} />
            )}
          </div>

          {isUpcoming ? (
            <>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  {renderTeamLogo(homeTeam)}
                  <p className="text-xs text-white/80 mt-1 line-clamp-2 font-medium max-w-[80px] mx-auto leading-tight">
                    {homeTeam.isHbc ? homeTeam.name : homeTeam.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
                <span className="text-white text-lg font-bold">VS</span>
                <div className="text-center">
                  {renderTeamLogo(awayTeam)}
                  <p className="text-xs text-white/80 mt-1 line-clamp-2 font-medium max-w-[80px] mx-auto leading-tight">
                    {awayTeam.isHbc ? awayTeam.name : awayTeam.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-white text-sm mt-auto">
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">
                    {formatDate(match.date)} • {formatTime(match.date)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 mx-auto p-2 relative overflow-hidden">
                    <Image
                      src="/img/home/logo.png"
                      alt="HBC Aix-en-Savoie"
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className={`text-3xl font-bold ${isWin ? 'text-green-500' : 'text-white/60'}`}>
                    {match.scoreEquipe}
                  </div>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2 font-medium max-w-[80px] mx-auto leading-tight">{match.equipe.nom}</p>
                </div>
                <div className="text-white/40 text-xl font-bold">-</div>
                <div className="text-center flex-1">
                  {match.logoAdversaire ? (
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 mx-auto p-2 relative overflow-hidden">
                      <Image
                        src={match.logoAdversaire}
                        alt={match.adversaire}
                        fill
                        className="object-contain p-1.5"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <span className="text-white/60 font-bold text-xs">
                        {match.adversaire.substring(0, 3)}
                      </span>
                    </div>
                  )}
                  <div className={`text-3xl font-bold ${isLoss ? 'text-red-500' : 'text-white/60'}`}>
                    {match.scoreAdversaire}
                  </div>
                  <p className="text-xs text-white/60 mt-1 line-clamp-1 font-medium">{match.adversaire.split(' ').slice(0, 2).join(' ')}</p>
                </div>
              </div>

              <div className={`flex items-center justify-center gap-2 ${isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-yellow-500'} text-sm font-bold mt-auto`}>
                {isWin ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>VICTOIRE</span>
                  </>
                ) : match.scoreEquipe === match.scoreAdversaire ? (
                  <span>MATCH NUL</span>
                ) : (
                  <span>DÉFAITE</span>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Prochains matchs */}
      {upcomingMatches.length > 0 && (
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
          {upcomingMatches.slice(0, 2).map((match) => (
            <div key={match.id}>
              {renderMatchCard(match, true)}
            </div>
          ))}
        </div>
      )}

      {/* Derniers résultats */}
      {lastResults.filter(m => m.scoreEquipe !== null && m.scoreAdversaire !== null).length > 0 && (
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
          {lastResults.filter(m => m.scoreEquipe !== null && m.scoreAdversaire !== null).slice(0, 2).map((match) => (
            <div key={match.id}>
              {renderMatchCard(match, false)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
