'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, User, Trophy, MapPin } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'

interface Entrainement {
  id: number
  jour: string
  horaire: string
  lieu?: string | null
}

interface Classement {
  id: number
  position: number
  club: string
  points: number
}

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string | null
  domicile: boolean
  logoAdversaire: string | null
}

interface Equipe {
  id: number
  nom: string
  categorie: string
  description: string
  entraineur: string
  matches: string | null
  photo: string
  slug: string
  entrainements: Entrainement[]
  classement: Classement[]
  matchs: Match[]
}

interface TeamCardDetailedProps {
  equipe: Equipe
}

export function TeamCardDetailed({ equipe }: TeamCardDetailedProps) {
  return (
    <motion.div
      id={`equipe-${equipe.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-zinc-700/30 transform transition-all hover:-translate-y-2 hover:shadow-xl"
    >
      {/* Image avec overlay */}
      <div className="h-64 bg-zinc-700 relative overflow-hidden group">
        <Image
          src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
          alt={equipe.nom}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="inline-block bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
            {equipe.categorie}
          </div>
          <h3 className="text-white text-xl font-bold">{equipe.nom}</h3>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <p className="text-gray-300 mb-4">{equipe.description}</p>

        {/* Entraîneur */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              <h4 className="text-white font-semibold">Entraîneur</h4>
            </div>
            <span className="text-primary-500">{equipe.entraineur}</span>
          </div>
          <div className="w-full h-px bg-zinc-700 mb-4"></div>

          {/* Entraînements */}
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            Entraînements
          </h4>
          <ul className="text-gray-300 text-sm space-y-1 mb-4">
            {equipe.entrainements.map((entrainement) => (
              <li key={entrainement.id} className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {entrainement.jour} : {entrainement.horaire}
              </li>
            ))}
          </ul>

          {/* Position au classement */}
          {equipe.classement.length > 0 && (() => {
            const ourTeam = equipe.classement.find(team =>
              team.club.toUpperCase().includes('AIX') ||
              team.club.toUpperCase().includes('SAVOIE')
            )
            const getOrdinal = (n: number) => {
              if (n === 1) return '1er'
              return `${n}e`
            }
            return ourTeam ? (
              <div className="flex items-center justify-between text-gray-300 text-sm mb-4 bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/50">
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-primary-500" />
                  <span className="text-white font-semibold">Classement</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500 text-white font-bold text-sm">
                  {getOrdinal(ourTeam.position)}
                </span>
              </div>
            ) : null
          })()}

          {/* Prochain match */}
          {equipe.matchs.length > 0 && (() => {
            const nextMatch = equipe.matchs[0]
            return (
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  Prochain match
                </h4>
                <div className="text-gray-300 text-sm space-y-1 bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{nextMatch.adversaire}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      nextMatch.domicile
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {nextMatch.domicile ? 'Domicile' : 'Extérieur'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Calendar className="w-3 h-3 mr-1 text-primary-500" />
                    <span>
                      {new Date(nextMatch.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {nextMatch.lieu && (
                    <div className="flex items-center text-xs">
                      <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                      <span>{nextMatch.lieu}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Bouton voir l'équipe */}
        <Link
          href={`/equipes/${equipe.slug}`}
          className="w-full inline-block text-center bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Voir l'équipe
        </Link>
      </div>
    </motion.div>
  )
}
