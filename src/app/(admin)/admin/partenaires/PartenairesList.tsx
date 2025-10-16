'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deletePartenaire, togglePublished } from './actions'
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
import type { Partenaire } from '@prisma/client'

interface PartenairesListProps {
  initialPartenaires: Partenaire[]
}

export function PartenairesList({ initialPartenaires }: PartenairesListProps) {
  const [partenaires, setPartenaires] = useState(initialPartenaires)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deletePartenaire(deleteId)
      setPartenaires(partenaires.filter((p) => p.id !== deleteId))
      toast.success('Partenaire supprimé')
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
      setPartenaires(
        partenaires.map((p) =>
          p.id === id ? { ...p, published: !p.published } : p
        )
      )
      toast.success('Statut modifié')
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Logo</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Ordre</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partenaires.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Aucun partenaire
              </TableCell>
            </TableRow>
          ) : (
            partenaires.map((partenaire) => (
              <TableRow key={partenaire.id}>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                </TableCell>
                <TableCell>
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                    <Image
                      src={partenaire.logo}
                      alt={partenaire.nom}
                      fill
                      className="object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{partenaire.nom}</TableCell>
                <TableCell>{partenaire.categorie}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={partenaire.published ? 'published' : 'draft'}
                  />
                  {partenaire.partenaire_majeur && (
                    <StatusBadge status="featured" className="ml-2" />
                  )}
                </TableCell>
                <TableCell>{partenaire.ordre}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/partenaires/${partenaire.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublished(partenaire.id)}
                      >
                        {partenaire.published ? (
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
                        onClick={() => setDeleteId(partenaire.id)}
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
        title="Supprimer ce partenaire ?"
        description="Cette action est irréversible. Le partenaire et son logo seront définitivement supprimés."
      />
    </>
  )
}
