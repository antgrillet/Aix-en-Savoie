'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteEquipe, togglePublished } from './actions'
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
import type { Equipe, Entrainement } from '@prisma/client'

interface EquipesListProps {
  initialEquipes: (Equipe & { entrainements: Entrainement[] })[]
}

export function EquipesList({ initialEquipes }: EquipesListProps) {
  const [equipes, setEquipes] = useState(initialEquipes)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteEquipe(deleteId)
      setEquipes(equipes.filter((e) => e.id !== deleteId))
      toast.success('Équipe supprimée')
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
      setEquipes(
        equipes.map((e) =>
          e.id === id ? { ...e, published: !e.published } : e
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
            <TableHead>Photo</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Entraîneur</TableHead>
            <TableHead>Entraînements</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Ordre</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                Aucune équipe
              </TableCell>
            </TableRow>
          ) : (
            equipes.map((equipe) => (
              <TableRow key={equipe.id}>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                </TableCell>
                <TableCell>
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                    <Image
                      src={equipe.photo}
                      alt={equipe.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{equipe.nom}</TableCell>
                <TableCell>{equipe.categorie}</TableCell>
                <TableCell>{equipe.entraineur}</TableCell>
                <TableCell>{equipe.entrainements.length}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={equipe.published ? 'published' : 'draft'}
                  />
                </TableCell>
                <TableCell>{equipe.ordre}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/equipes/${equipe.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublished(equipe.id)}
                      >
                        {equipe.published ? (
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
                        onClick={() => setDeleteId(equipe.id)}
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
        title="Supprimer cette équipe ?"
        description="Cette action est irréversible. L'équipe et tous ses entraînements seront supprimés."
      />
    </>
  )
}
