import { PageHeader } from '@/components/admin/PageHeader'
import { ArticleForm } from '../ArticleForm'
import { createArticle } from '../actions'

export default function NewArticlePage() {
  return (
    <div>
      <PageHeader
        title="Nouvel article"
        description="Rédigez l'article, choisissez son image, puis publiez-le ou gardez-le en brouillon."
        back={{ href: '/admin/articles', label: 'Articles' }}
      />
      <ArticleForm action={createArticle} />
    </div>
  )
}
