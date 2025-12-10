'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, GripVertical, MoreVertical, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deletePartenaire, togglePublished, deleteMultiplePartenaires, updateOrdre } from './actions'
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
import type { Partenaire } from '@prisma/client'

interface PartenairesListProps {
  initialPartenaires: Partenaire[]
}

function SortableRow({ partenaire, onDelete, onTogglePublished, onToggleSelect, isSelected }: {
  partenaire: Partenaire
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
  } = useSortable({ id: partenaire.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="hidden md:table-cell">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
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
      <TableCell className="hidden lg:table-cell">{partenaire.categorie}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <StatusBadge
            status={partenaire.published ? 'published' : 'draft'}
          />
          {partenaire.partenaire_majeur && (
            <StatusBadge status="featured" />
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{partenaire.ordre}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/partenaires/${partenaire.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Link>
            </DropdownMenuItem>
            {partenaire.site && (
              <DropdownMenuItem asChild>
                <a href={partenaire.site} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le site
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onTogglePublished}>
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

// Mobile Card Component
function PartenaireCard({ partenaire, onDelete, onTogglePublished }: {
  partenaire: Partenaire
  onDelete: () => void
  onTogglePublished: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={partenaire.logo}
              alt={partenaire.nom}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-sm">{partenaire.nom}</h3>
                <p className="text-xs text-muted-foreground">{partenaire.categorie}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/partenaires/${partenaire.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  {partenaire.site && (
                    <DropdownMenuItem asChild>
                      <a href={partenaire.site} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir le site
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onTogglePublished}>
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
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={partenaire.published ? 'published' : 'draft'} />
              {partenaire.partenaire_majeur && <StatusBadge status="featured" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PartenairesList({ initialPartenaires }: PartenairesListProps) {
  const [partenaires, setPartenaires] = useState(initialPartenaires)
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      await deleteMultiplePartenaires(selectedIds)
      setPartenaires(partenaires.filter((p) => !selectedIds.includes(p.id)))
      toast.success(`${selectedIds.length} partenaire${selectedIds.length > 1 ? 's' : ''} supprimé${selectedIds.length > 1 ? 's' : ''}`)
      setSelectedIds([])
      setShowBulkDelete(false)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === partenaires.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(partenaires.map((p) => p.id))
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

    const oldIndex = partenaires.findIndex((p) => p.id === active.id)
    const newIndex = partenaires.findIndex((p) => p.id === over.id)

    const newPartenaires = arrayMove(partenaires, oldIndex, newIndex)

    // Mettre à jour l'ordre local immédiatement
    setPartenaires(newPartenaires)

    // Préparer les mises à jour pour le serveur
    const updates = newPartenaires.map((partenaire, index) => ({
      id: partenaire.id,
      ordre: index,
    }))

    try {
      await updateOrdre(updates)
      toast.success('Ordre mis à jour')
    } catch (error) {
      // Restaurer l'ancien ordre en cas d'erreur
      setPartenaires(partenaires)
      toast.error('Erreur lors de la mise à jour de l\'ordre')
    }
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} partenaire{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Vue Mobile - Cartes */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {partenaires.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucun partenaire
          </div>
        ) : (
          partenaires.map((partenaire) => (
            <PartenaireCard
              key={partenaire.id}
              partenaire={partenaire}
              onDelete={() => setDeleteId(partenaire.id)}
              onTogglePublished={() => handleTogglePublished(partenaire.id)}
            />
          ))
        )}
      </div>

      {/* Vue Desktop - Table avec drag & drop */}
      <div className="hidden md:block">
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
                    checked={selectedIds.length === partenaires.length && partenaires.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[70px]">Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden lg:table-cell">Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden lg:table-cell">Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partenaires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucun partenaire
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={partenaires.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {partenaires.map((partenaire) => (
                    <SortableRow
                      key={partenaire.id}
                      partenaire={partenaire}
                      onDelete={() => setDeleteId(partenaire.id)}
                      onTogglePublished={() => handleTogglePublished(partenaire.id)}
                      onToggleSelect={() => toggleSelectOne(partenaire.id)}
                      isSelected={selectedIds.includes(partenaire.id)}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce partenaire ?"
        description="Cette action est irréversible. Le partenaire et son logo seront définitivement supprimés."
      />

      <DeleteDialog
        open={showBulkDelete}
        onOpenChange={(open) => !open && setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        title={`Supprimer ${selectedIds.length} partenaire${selectedIds.length > 1 ? 's' : ''} ?`}
        description={`Cette action est irréversible. ${selectedIds.length} partenaire${selectedIds.length > 1 ? 's' : ''} et leurs logos seront définitivement supprimés.`}
      />
    </>
  )
}
