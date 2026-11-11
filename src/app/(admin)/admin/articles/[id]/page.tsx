import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
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
    <div>
      <PageHeader
        title="Modifier l'article"
        description={article.titre}
        back={{ href: '/admin/articles', label: 'Articles' }}
        actions={
          <Button asChild variant="outline">
            <Link href={`/actus/${article.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              Prévisualiser
              <span className="sr-only"> (nouvel onglet)</span>
            </Link>
          </Button>
        }
      />
      <ArticleForm action={updateWithId} initialData={article} />
    </div>
  )
}
