'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  MoreHorizontal,
  Newspaper,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteArticle, togglePublished, toggleVedette } from './actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatParis } from '@/lib/match-format'
import type { Article } from '@/generated/prisma/client'

interface ArticlesListProps {
  initialArticles: Article[]
}

// Date courte, toujours à l'heure de Paris (identique côté serveur et navigateur)
function formatArticleDate(date: Date) {
  return formatParis(date, { day: 'numeric', month: 'short', year: 'numeric' })
}

function ArticleActions({
  article,
  onTogglePublished,
  onToggleVedette,
  onDelete,
}: {
  article: Article
  onTogglePublished: () => void
  onToggleVedette: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
          <MoreHorizontal />
          <span className="sr-only">Actions pour « {article.titre} »</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/admin/articles/${article.id}`}>
            <Edit />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/actus/${article.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            Voir sur le site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onTogglePublished}>
          {article.published ? (
            <>
              <EyeOff />
              Dépublier
            </>
          ) : (
            <>
              <Eye />
              Publier
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleVedette}>
          <Star className={article.vedette ? 'fill-current' : undefined} />
          {article.vedette ? 'Retirer de la vedette' : 'Mettre en vedette'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtres
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(initialArticles.map(a => a.categorie))
    return Array.from(cats).sort()
  }, [initialArticles])

  // Filtrer les articles
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = search === '' ||
        article.titre.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' ||
        article.categorie === categoryFilter
      const matchesStatus = statusFilter === 'all' ||
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
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublished = async (id: number) => {
    try {
      await togglePublished(id)
      setArticles(
        articles.map((a) =>
          a.id === id ? { ...a, published: !a.published } : a
        )
      )
      toast.success('Statut modifié')
    } catch {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleToggleVedette = async (id: number) => {
    try {
      await toggleVedette(id)
      setArticles(
        articles.map((a) =>
          a.id === id ? { ...a, vedette: !a.vedette } : a
        )
      )
      toast.success('Statut vedette modifié')
    } catch {
      toast.error('Erreur lors de la modification')
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* Recherche et filtres */}
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article…"
              aria-label="Rechercher un article"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 md:h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label="Filtrer par catégorie" className="h-10 md:h-9 md:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filtrer par statut" className="h-10 md:h-9 md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="featured">En vedette</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="col-span-2 h-10 text-muted-foreground md:h-9">
                <X />
                Effacer
              </Button>
            )}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Newspaper className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {hasActiveFilters ? 'Aucun article trouvé' : 'Aucun article'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Modifiez la recherche ou les filtres.'
                : 'Les articles créés apparaîtront ici.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Article</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Catégorie</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Date</th>
                <th scope="col" className="hidden px-4 py-3 text-right font-medium xl:table-cell">Vues</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Statut</th>
                <th scope="col" className="w-14 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={article.image} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="line-clamp-2 rounded-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:line-clamp-1"
                        >
                          {article.titre}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                          {article.categorie} · {formatArticleDate(article.date)}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
                          <StatusBadge status={article.published ? 'published' : 'draft'} />
                          {article.vedette && <StatusBadge status="featured" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="whitespace-nowrap rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {article.categorie}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatArticleDate(article.date)}
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground xl:table-cell">
                    {article.views}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={article.published ? 'published' : 'draft'} />
                      {article.vedette && <StatusBadge status="featured" />}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right sm:px-4">
                    <ArticleActions
                      article={article}
                      onTogglePublished={() => handleTogglePublished(article.id)}
                      onToggleVedette={() => handleToggleVedette(article.id)}
                      onDelete={() => setDeleteId(article.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          {hasActiveFilters
            ? `${filteredArticles.length} sur ${articles.length} article${articles.length > 1 ? 's' : ''}`
            : `${articles.length} article${articles.length > 1 ? 's' : ''}`}
        </div>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cet article ?"
        description="Cette action est irréversible. L'article et son image seront définitivement supprimés."
      />
    </>
  )
}
