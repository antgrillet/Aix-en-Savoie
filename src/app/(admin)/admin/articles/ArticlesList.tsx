'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, EyeOff, ExternalLink, Pencil, Plus, Star, StarOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { DataList, Thumb, type DataColumn } from '@/components/admin/DataList'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { FilterBar, FilterGroup, SearchField } from '@/components/admin/FilterBar'
import { RowActions } from '@/components/admin/RowActions'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { deleteArticle, togglePublished, toggleVedette } from './actions'
import type { Article } from '@/generated/prisma/client'

export type ArticleStatusFilter = 'all' | 'published' | 'draft' | 'featured'

interface ArticlesListProps {
  initialArticles: Article[]
  initialStatus?: ArticleStatusFilter
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'featured', label: 'En vedette' },
] as const

export function ArticlesList({ initialArticles, initialStatus = 'all' }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtres
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)

  // Extraire les catégories uniques
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(initialArticles.map((a) => a.categorie))).sort()
    return [
      { value: 'all', label: 'Toutes catégories' },
      ...cats.map((cat) => ({ value: cat, label: cat })),
    ]
  }, [initialArticles])

  // Filtrer les articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        search === '' || article.titre.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || article.categorie === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && article.published) ||
        (statusFilter === 'draft' && !article.published) ||
        (statusFilter === 'featured' && article.vedette)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [articles, search, categoryFilter, statusFilter])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters = search !== '' || categoryFilter !== 'all' || statusFilter !== 'all'

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteArticle(deleteId)
      setArticles(articles.filter((a) => a.id !== deleteId))
      toast.success('Article supprimé')
      setDeleteId(null)
    } catch {
      toast.error("L'article n'a pas pu être supprimé. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublished = async (article: Article) => {
    try {
      await togglePublished(article.id)
      setArticles(
        articles.map((a) => (a.id === article.id ? { ...a, published: !a.published } : a))
      )
      toast.success(article.published ? 'Article repassé en brouillon' : 'Article publié')
    } catch {
      toast.error("Le statut n'a pas pu être modifié. Réessayez dans un instant.")
    }
  }

  const handleToggleVedette = async (article: Article) => {
    try {
      await toggleVedette(article.id)
      setArticles(articles.map((a) => (a.id === article.id ? { ...a, vedette: !a.vedette } : a)))
      toast.success(article.vedette ? 'Article retiré de la vedette' : 'Article mis en vedette')
    } catch {
      toast.error("La mise en vedette n'a pas pu être modifiée. Réessayez dans un instant.")
    }
  }

  const columns: DataColumn<Article>[] = [
    {
      id: 'titre',
      header: 'Titre',
      phone: 'title',
      cell: (article) => (
        <>
          <Link
            href={`/admin/articles/${article.id}`}
            className="adm-row-link line-clamp-2 font-semibold decoration-1 underline-offset-4 hover:underline"
          >
            {article.titre}
          </Link>
          <span className="adm-meta hidden md:block lg:hidden">
            {article.categorie} · {format(new Date(article.date), 'd MMM yyyy', { locale: fr })}
          </span>
        </>
      ),
    },
    {
      id: 'categorie',
      header: 'Catégorie',
      className: 'hidden lg:table-cell',
      cell: (article) => article.categorie,
    },
    {
      id: 'date',
      header: 'Date',
      className: 'hidden whitespace-nowrap lg:table-cell',
      cell: (article) => format(new Date(article.date), 'd MMM yyyy', { locale: fr }),
    },
    {
      id: 'statut',
      header: 'Statut',
      phone: 'marks',
      cell: (article) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={article.published ? 'published' : 'draft'} />
          {article.vedette && <StatusBadge status="featured" />}
        </span>
      ),
    },
    {
      id: 'vues',
      header: 'Vues',
      align: 'end',
      className: 'hidden lg:table-cell',
      cell: (article) => (
        <>
          <span className="adm-num-sm">{article.views}</span>
          <span className="md:sr-only"> {article.views > 1 ? 'vues' : 'vue'}</span>
        </>
      ),
    },
  ]

  return (
    <>
      <FilterBar
        label="Filtrer les articles"
        onReset={hasActiveFilters ? clearFilters : undefined}
        count={{
          shown: filteredArticles.length,
          total: articles.length,
          singular: 'article',
          plural: 'articles',
        }}
      >
        <SearchField value={search} onChange={setSearch} label="Rechercher un article par son titre" placeholder="Rechercher un titre" />
        <FilterGroup>
          <SimpleSelect
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            options={categoryOptions}
            aria-label="Catégorie"
            className="md:w-52"
          />
          <SimpleSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_OPTIONS}
            aria-label="Statut"
            className="md:w-44"
          />
        </FilterGroup>
      </FilterBar>

      <DataList
        caption="Articles"
        items={filteredArticles}
        columns={columns}
        getKey={(article) => article.id}
        media={(article) => <Thumb src={article.image} />}
        actions={(article) => (
          <RowActions
            label={`Actions pour « ${article.titre} »`}
            items={[
              { label: 'Modifier', icon: Pencil, href: `/admin/articles/${article.id}` },
              {
                label: 'Prévisualiser',
                icon: ExternalLink,
                href: `/actus/${article.slug}`,
                external: true,
              },
              {
                label: article.published ? 'Dépublier' : 'Publier',
                icon: article.published ? EyeOff : Eye,
                onSelect: () => handleTogglePublished(article),
              },
              {
                label: article.vedette ? 'Retirer de la vedette' : 'Mettre en vedette',
                icon: article.vedette ? StarOff : Star,
                onSelect: () => handleToggleVedette(article),
              },
              'separator',
              {
                label: 'Supprimer',
                icon: Trash2,
                destructive: true,
                onSelect: () => setDeleteId(article.id),
              },
            ]}
          />
        )}
        empty={
          hasActiveFilters ? (
            <EmptyState
              title="Aucun article ne correspond"
              action={
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              }
            >
              <p>Élargissez la recherche ou retirez un filtre pour retrouver les autres articles.</p>
            </EmptyState>
          ) : (
            <EmptyState
              title="Aucun article pour l'instant"
              action={
                <Button asChild>
                  <Link href="/admin/articles/new">
                    <Plus aria-hidden="true" />
                    Écrire le premier article
                  </Link>
                </Button>
              }
            >
              <p>
                Un article annonce un match, raconte un week-end ou présente un événement du club.
                À l'enregistrement, vous choisissez de le publier ou de le garder en brouillon.
              </p>
            </EmptyState>
          )
        }
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cet article ?"
        description="Cette action est irréversible. L'article et son image seront définitivement supprimés."
        confirmLabel="Supprimer l'article"
      />
    </>
  )
}
