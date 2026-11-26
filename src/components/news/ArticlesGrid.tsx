'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArticleCard } from './ArticleCard'
import { staggerContainer, staggerItem } from '@/lib/animations'
import type { NewsArticle } from './types'

interface ArticlesGridProps {
  articles: NewsArticle[]
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      variants={staggerContainer}
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {articles.map((article) => (
        <motion.li key={article.id} variants={staggerItem} className="h-full">
          <ArticleCard article={article} />
        </motion.li>
      ))}
    </motion.ul>
  )
}
