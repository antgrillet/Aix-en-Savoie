'use client'

import { useState } from 'react'
import { TeamsFilters } from './TeamsFilters'
import { TeamCardDetailed } from './TeamCardDetailed'

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

interface TeamsPageClientProps {
  equipes: Equipe[]
}

export function TeamsPageClient({ equipes }: TeamsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Filtrer les équipes en fonction de la catégorie active
  const filteredEquipes =
    activeCategory === 'all'
      ? equipes
      : equipes.filter((equipe) => equipe.categorie === activeCategory)

  return (
    <div>
      {/* Section principale avec filtres */}
      <section className="mb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pattern"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center relative inline-block w-full">
            Accès rapide
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-transparent"></span>
          </h2>

          {/* Filtres par catégorie */}
          <TeamsFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </section>

      {/* Liste des équipes */}
      <section id="liste-equipes" className="py-16 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center relative inline-block w-full">
            Découvrez nos équipes
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-transparent"></span>
          </h2>

          {/* Conteneur des équipes */}
          {filteredEquipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white text-xl">Aucune équipe ne correspond à ce filtre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEquipes.map((equipe) => (
                <TeamCardDetailed key={equipe.id} equipe={equipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="py-16 bg-gradient-to-r from-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-500 rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-400 rounded-full opacity-40 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary-600 rounded-full opacity-30 blur-xl"></div>

            <div className="relative z-10 md:flex items-center justify-between">
              <div className="md:w-2/3 md:pr-8 mb-8 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Rejoignez nos équipes !
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  Envie de pratiquer le handball dans une ambiance conviviale ? Nous accueillons de
                  nouveaux joueurs tout au long de l'année, quel que soit votre niveau.
                </p>
                <ul className="space-y-2 mb-6 text-white/90">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Des équipes pour tous les âges
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Des entraîneurs qualifiés
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Un club familial et convivial
                  </li>
                </ul>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <a
                  href="/contact"
                  className="inline-block px-8 py-4 bg-black text-white text-lg font-bold rounded-lg shadow-lg hover:bg-zinc-800 transition-all transform hover:-translate-y-1 hover:shadow-xl"
                >
                  S'inscrire au club
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
