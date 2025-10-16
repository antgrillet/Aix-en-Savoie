'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit, Trash2, Eye, EyeOff, Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteArticle, togglePublished, toggleVedette } from './actions'
import { toast } from 'sonner'
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
import type { Article } from '@prisma/client'

interface ArticlesListProps {
  initialArticles: Article[]
}

export function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Vues</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Aucun article
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                    <Image
                      src={article.image}
                      alt={article.titre}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {article.titre}
                </TableCell>
                <TableCell>{article.categorie}</TableCell>
                <TableCell>
                  {format(new Date(article.date), 'dd MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <StatusBadge
                      status={article.published ? 'published' : 'draft'}
                    />
                    {article.vedette && <StatusBadge status="featured" />}
                  </div>
                </TableCell>
                <TableCell>{article.views}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
