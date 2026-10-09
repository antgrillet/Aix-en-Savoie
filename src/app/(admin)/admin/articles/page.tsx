import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getArticles } from './actions'
import { ArticlesList } from './ArticlesList'

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div>
      <AdminPageHeader
        title="Articles"
        description="Gérez les articles et actualités du club"
        actions={
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus />
              Nouvel article
            </Link>
          </Button>
        }
      />

      <ArticlesList initialArticles={articles} />
    </div>
  )
}
