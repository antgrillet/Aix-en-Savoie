'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteEquipe, togglePublished, deleteMultipleEquipes, updateOrdre } from './actions'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

function SortableRow({ equipe, onDelete, onTogglePublished, onToggleSelect, isSelected }: {
  equipe: Equipe & { entrainements: Entrainement[] }
  onDelete: () => void
  onTogglePublished: () => void
  onToggleSelect: () => void
  isSelected: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: equipe.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />
      </TableCell>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
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
            <DropdownMenuItem onClick={onTogglePublished}>
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
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function EquipesList({ initialEquipes }: EquipesListProps) {
  const [equipes, setEquipes] = useState(initialEquipes)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      await deleteMultipleEquipes(selectedIds)
      setEquipes(equipes.filter((e) => !selectedIds.includes(e.id)))
      toast.success(`${selectedIds.length} équipe${selectedIds.length > 1 ? 's' : ''} supprimée${selectedIds.length > 1 ? 's' : ''}`)
      setSelectedIds([])
      setShowBulkDelete(false)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === equipes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(equipes.map((e) => e.id))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = equipes.findIndex((e) => e.id === active.id)
    const newIndex = equipes.findIndex((e) => e.id === over.id)

    const newEquipes = arrayMove(equipes, oldIndex, newIndex)

    // Mettre à jour l'ordre local immédiatement
    setEquipes(newEquipes)

    // Préparer les mises à jour pour le serveur
    const updates = newEquipes.map((equipe, index) => ({
      id: equipe.id,
      ordre: index,
    }))

    try {
      await updateOrdre(updates)
      toast.success('Ordre mis à jour')
    } catch (error) {
      // Restaurer l'ancien ordre en cas d'erreur
      setEquipes(equipes)
      toast.error('Erreur lors de la mise à jour de l\'ordre')
    }
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} équipe{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer la sélection
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            Annuler
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length === equipes.length && equipes.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
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
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Aucune équipe
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={equipes.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {equipes.map((equipe) => (
                  <SortableRow
                    key={equipe.id}
                    equipe={equipe}
                    onDelete={() => setDeleteId(equipe.id)}
                    onTogglePublished={() => handleTogglePublished(equipe.id)}
                    onToggleSelect={() => toggleSelectOne(equipe.id)}
                    isSelected={selectedIds.includes(equipe.id)}
                  />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </DndContext>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cette équipe ?"
        description="Cette action est irréversible. L'équipe et tous ses entraînements seront supprimés."
      />

      <DeleteDialog
        open={showBulkDelete}
        onOpenChange={(open) => !open && setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        title={`Supprimer ${selectedIds.length} équipe${selectedIds.length > 1 ? 's' : ''} ?`}
        description={`Cette action est irréversible. ${selectedIds.length} équipe${selectedIds.length > 1 ? 's' : ''} et tous leurs entraînements seront supprimés.`}
      />
    </>
  )
}
