'use client'

import { motion } from 'framer-motion'

interface TeamsFiltersProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { value: 'all', label: 'Toutes' },
  { value: 'N2F', label: 'N2F' },
  { value: 'N2M', label: 'N2M' },
  { value: 'Prénationale', label: 'Prénationale' },
  { value: 'Elite', label: '-18 ans' },
  { value: 'Excellence', label: '-15 ans' },
  { value: 'Départemental', label: '-13 ans / -11 ans' },
  { value: 'Découverte', label: 'Baby Hand' },
  { value: 'Mixte', label: 'Loisirs' },
]

export function TeamsFilters({ activeCategory, onCategoryChange }: TeamsFiltersProps) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 shadow-xl mb-8">
      <h3 className="text-xl text-white font-semibold mb-4">Catégories</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <motion.button
            key={category.value}
            type="button"
            onClick={() => onCategoryChange(category.value)}
            className={`px-4 py-2 font-medium rounded-lg shadow-md transition-all ${
              activeCategory === category.value
                ? 'bg-primary-500 text-white'
                : 'bg-zinc-800 text-white hover:bg-primary-500'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
