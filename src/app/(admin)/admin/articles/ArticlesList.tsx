'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit, Trash2, Eye, EyeOff, Star, ExternalLink, Search, X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteArticle, togglePublished, toggleVedette } from './actions'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Article } from '@prisma/client'

interface ArticlesListProps {
  initialArticles: Article[]
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const ArticleActions = ({ article }: { article: Article }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/articles/${article.id}`}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/actus/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Prévisualiser
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleTogglePublished(article.id)}
        >
          {article.published ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Dépublier
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Publier
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleToggleVedette(article.id)}
        >
          <Star className={`w-4 h-4 mr-2 ${article.vedette ? 'fill-current' : ''}`} />
          {article.vedette ? 'Retirer vedette' : 'Mettre en vedette'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeleteId(article.id)}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Filtres - responsive */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="featured">En vedette</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
      </div>

      {/* Vue Mobile - Cartes */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredArticles.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {hasActiveFilters ? 'Aucun article trouvé' : 'Aucun article'}
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-3 p-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={article.image}
                      alt={article.titre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm line-clamp-2">{article.titre}</h3>
                      <ArticleActions article={article} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.categorie} • {format(new Date(article.date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={article.published ? 'published' : 'draft'} />
                      {article.vedette && <StatusBadge status="featured" />}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vue Desktop - Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead className="hidden lg:table-cell">Catégorie</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Vues</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {hasActiveFilters ? 'Aucun article trouvé' : 'Aucun article'}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative w-14 h-14 rounded overflow-hidden bg-muted">
                      <Image
                        src={article.image}
                        alt={article.titre}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium line-clamp-1 max-w-[200px] lg:max-w-[300px]">
                      {article.titre}
                    </div>
                    <div className="text-xs text-muted-foreground lg:hidden mt-1">
                      {article.categorie} • {format(new Date(article.date), 'dd/MM/yy', { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{article.categorie}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(article.date), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={article.published ? 'published' : 'draft'} />
                      {article.vedette && <StatusBadge status="featured" />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{article.views}</TableCell>
                  <TableCell className="text-right">
                    <ArticleActions article={article} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
