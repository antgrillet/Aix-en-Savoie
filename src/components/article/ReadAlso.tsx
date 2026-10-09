import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Article } from '@/generated/prisma/client'
import { ArticleCard } from '@/components/news/ArticleCard'
import { SectionHeader } from '@/components/site/SectionHeader'
import { container, siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface ReadAlsoProps {
  articles: Pick<Article, 'id' | 'titre' | 'slug' | 'image' | 'date' | 'resume'>[]
  /** Catégorie commune aux articles proposés (même catégorie que l'article lu) */
  categorie: string
}

export function ReadAlso({ articles, categorie }: ReadAlsoProps) {
  if (articles.length === 0) return null

  return (
    <section aria-labelledby="read-also-title" className="border-t border-white/10 bg-neutral-900 py-16 md:py-24">
      <div className={container}>
        <SectionHeader
          eyebrow="Dans la même catégorie"
          title={<span id="read-also-title">À lire aussi</span>}
          action={
            <Link href="/actus" className={cn(siteButton({ variant: 'outline' }), 'group')}>
              Toutes les actus
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        {/* Trois articles maximum pour une grille régulière */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={{ ...article, categorie }} />
          ))}
        </div>
      </div>
    </section>
  )
}
