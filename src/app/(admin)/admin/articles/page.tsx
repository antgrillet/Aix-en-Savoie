import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getArticles } from './actions'
import { ArticlesList } from './ArticlesList'

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Articles
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les articles et actualités du club
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 w-full sm:w-auto">
          <Link href="/admin/articles/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Liste des articles
          </CardTitle>
          <CardDescription>
            {articles.length} article{articles.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticlesList initialArticles={articles} />
        </CardContent>
      </Card>
    </div>
  )
}
