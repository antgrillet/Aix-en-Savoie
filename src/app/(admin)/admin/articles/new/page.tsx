import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticleForm } from '../ArticleForm'
import { createArticle } from '../actions'

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvel article</h1>
        <p className="text-muted-foreground">
          Créez un nouvel article ou actualité
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'article</CardTitle>
          <CardDescription>
            Remplissez les informations de l'article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm action={createArticle} />
        </CardContent>
      </Card>
    </div>
  )
}
