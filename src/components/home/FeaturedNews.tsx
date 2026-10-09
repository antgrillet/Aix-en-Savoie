import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ArticleCard } from '@/components/news/ArticleCard'
import { SectionHeader } from '@/components/site/SectionHeader'
import { container, siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface Article {
  id: number
  titre: string
  categorie: string
  date: Date
  image: string
  resume: string
  slug: string
}

interface FeaturedNewsProps {
  articles: Article[]
}

export function FeaturedNews({ articles }: FeaturedNewsProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  const [first, ...others] = articles
  const side = others.slice(0, 2)
  const bottom = others.slice(2, 5)

  return (
    <section className="bg-neutral-950 py-20 md:py-28">
      <div className={container}>
        <SectionHeader
          eyebrow="Actualités"
          title="La vie du club"
          description="Résultats, événements, stages : toute l'actualité du HBC Aix-en-Savoie."
          action={
            <Link href="/actus" className={cn(siteButton({ variant: 'outline' }), 'group')}>
              Toutes les actus
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        <div className="grid gap-x-6 gap-y-6 sm:gap-y-10 lg:grid-cols-3">
          <ArticleCard article={first} featured className="lg:col-span-2" />
          {side.length > 0 && (
            <div className="grid gap-x-6 gap-y-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-1">
              {side.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {bottom.length > 0 && (
          <div className="mt-6 grid gap-x-6 sm:mt-10 gap-y-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {bottom.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
