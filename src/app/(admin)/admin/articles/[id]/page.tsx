import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticleForm } from '../ArticleForm'
import { getArticle, updateArticle } from '../actions'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticle(parseInt(id))

  if (!article) {
    notFound()
  }

  const updateWithId = updateArticle.bind(null, article.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier l'article</h1>
        <p className="text-muted-foreground">
          Modifiez les informations de l'article
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'article</CardTitle>
          <CardDescription>
            Modifiez les informations de l'article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm action={updateWithId} initialData={article} />
        </CardContent>
      </Card>
    </div>
  )
}
