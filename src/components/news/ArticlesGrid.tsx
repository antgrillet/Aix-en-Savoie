import { ArticleCard } from './ArticleCard'

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
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
