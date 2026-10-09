import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ArticleForm } from '../ArticleForm'
import { createArticle } from '../actions'

export default function NewArticlePage() {
  return (
    <div>
      <AdminPageHeader
        backHref="/admin/articles"
        backLabel="Articles"
        title="Nouvel article"
        description="Rédigez une actualité pour le site du club"
      />

      <ArticleForm action={createArticle} />
    </div>
  )
}
