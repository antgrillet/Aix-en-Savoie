'use client'

import { useState } from 'react'
import { TeamsFilters } from './TeamsFilters'

interface Entrainement {
  id: number
  jour: string
  horaire: string
  lieu?: string | null
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
}

interface TeamsPageClientProps {
  equipes: Equipe[]
}

export function TeamsPageClient({ equipes }: TeamsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div>
      {/* Section principale avec filtres et carte unique */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pattern"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Découvrez nos équipes
          </h2>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <TeamsFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>

          {/* Carte unique centrée */}
          <div className="max-w-2xl mx-auto">
            <a
              href="#liste-equipes"
              className="block bg-white p-8 md:p-12 rounded-2xl text-center shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 group"
            >
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-xl shadow-primary-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 group-hover:text-primary-600 transition-colors">
                Explorez toutes nos équipes
              </h3>

              <p className="text-zinc-600 text-base md:text-lg mb-6 leading-relaxed">
                Des jeunes aux seniors, découvrez toutes nos équipes, leurs entraîneurs, horaires d'entraînement et bien plus encore.
              </p>

              <div className="inline-flex items-center gap-2 text-primary-600 font-semibold text-lg">
                <span>Voir toutes les équipes</span>
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
            </a>
          </div>
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
