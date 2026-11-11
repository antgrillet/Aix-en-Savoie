import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
import { getArticles } from './actions'
import { ArticlesList, type ArticleStatusFilter } from './ArticlesList'

const STATUTS: ArticleStatusFilter[] = ['all', 'published', 'draft', 'featured']

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string | string[] }>
}) {
  const [articles, { statut }] = await Promise.all([getArticles(), searchParams])

  // Le tableau de bord ouvre la liste déjà filtrée (`?statut=draft`)
  const initialStatus = STATUTS.find((value) => value === statut) ?? 'all'

  return (
    <div>
      <PageHeader
        title="Articles"
        description="Les actualités du club, visibles sur la page Actus et sur l'accueil du site une fois publiées."
        actions={
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus aria-hidden="true" />
              Nouvel article
            </Link>
          </Button>
        }
      />

      <ArticlesList initialArticles={articles} initialStatus={initialStatus} />
    </div>
  )
}
