import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatParis } from '@/lib/match-format'
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
      <AdminPageHeader
        backHref="/admin/articles"
        backLabel="Articles"
        title="Modifier l'article"
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={article.published ? 'published' : 'draft'} />
            {article.vedette && <StatusBadge status="featured" />}
            <span>
              Mis à jour le {formatParis(article.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </span>
        }
        actions={
          <Button variant="outline" asChild>
            <Link href={`/actus/${article.slug}`} target="_blank" rel="noopener noreferrer">
              Voir sur le site
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <ArticleForm action={updateWithId} initialData={article} />
    </div>
  )
}
