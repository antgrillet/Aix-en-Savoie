'use client'

import { motion } from 'framer-motion'
import { ArticleCard } from './ArticleCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Article {
  id: number
  titre: string
  categorie: string
  date: Date
  image: string
  resume: string
  slug: string
}

interface ArticlesGridProps {
  articles: Article[]
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
    >
      {articles.map((article) => (
        <motion.div key={article.id} variants={staggerItem} className="h-full">
          <ArticleCard article={article} />
        </motion.div>
      ))}
    </motion.div>
  )
}
