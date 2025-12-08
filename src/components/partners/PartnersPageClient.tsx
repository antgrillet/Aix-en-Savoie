'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { PartnerCard } from './PartnerCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Partenaire {
  id: number
  nom: string
  slug?: string | null
  categorie: string
  logo: string
  description: string
  site?: string | null
  partenaire_majeur: boolean
  ordre: number
  promoActive?: boolean
  promoTitre?: string | null
  promoCode?: string | null
  promoExpiration?: Date | string | null
}

interface PartnersPageClientProps {
  partenaires: Partenaire[]
  categories: string[]
}

export function PartnersPageClient({ partenaires, categories }: PartnersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous')

  // Partenaires avec offres actives (non expirées)
  const partenairesAvecOffres = useMemo(() => {
    return partenaires.filter(p => {
      if (!p.promoActive || !p.promoTitre) return false
      if (p.promoExpiration) {
        return new Date(p.promoExpiration) >= new Date()
      }
      return true
    })
  }, [partenaires])

  // Filtrer les partenaires
  const filteredPartenaires = useMemo(() => {
    let filtered = partenaires

    // Filtre par catégorie
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(p => p.categorie === selectedCategory)
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.categorie.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [partenaires, selectedCategory, searchQuery])

  // Séparer les partenaires majeurs
  const partenairesMajeurs = filteredPartenaires.filter(p => p.partenaire_majeur)
  const autresPartenaires = filteredPartenaires.filter(p => !p.partenaire_majeur)

  return (
    <div className="space-y-8">
      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-4"
      >
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un partenaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-zinc-800/40 border border-zinc-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-300">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Filtrer par catégorie</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('Tous')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selectedCategory === 'Tous'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-zinc-800/40 text-neutral-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              Tous ({partenaires.length})
            </button>
            {categories.map((cat) => {
              const count = partenaires.filter(p => p.categorie === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-zinc-800/40 text-neutral-300 hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Résultats */}
      {filteredPartenaires.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
        >
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun partenaire trouvé</h3>
          <p className="text-neutral-300 text-sm">
            Essayez de modifier votre recherche ou vos filtres
          </p>
        </motion.div>
      ) : (
        <>
          {/* Partenaires majeurs */}
          {partenairesMajeurs.length > 0 && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-primary-400 to-secondary-500 text-transparent bg-clip-text">
                    Partenaires Majeurs
                  </span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {partenairesMajeurs.map((partenaire) => (
                  <motion.div key={partenaire.id} variants={staggerItem}>
                    <PartnerCard partenaire={partenaire} featured />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Autres partenaires */}
          {autresPartenaires.length > 0 && (
            <div className="space-y-4">
              {partenairesMajeurs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Nos Partenaires
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                </motion.div>
              )}

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {autresPartenaires.map((partenaire) => (
                  <motion.div key={partenaire.id} variants={staggerItem}>
                    <PartnerCard partenaire={partenaire} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {partenaires.length}
          </div>
          <div className="text-xs text-neutral-300">Partenaires</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {partenairesMajeurs.length}
          </div>
          <div className="text-xs text-neutral-300">Majeurs</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">
            {partenairesAvecOffres.length}
          </div>
          <div className="text-xs text-neutral-300">Offres</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {categories.length}
          </div>
          <div className="text-xs text-neutral-300">Catégories</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {filteredPartenaires.length}
          </div>
          <div className="text-xs text-neutral-300">Affichés</div>
        </div>
      </motion.div>
    </div>
  )
}
