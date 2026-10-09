'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, GripVertical, MoreHorizontal, ExternalLink, Handshake, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Partenaire } from '@/generated/prisma/client'

interface PartenairesListProps {
  initialPartenaires: Partenaire[]
}

const headCell = 'h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground'

/** Vignette du logo, entièrement visible sur fond blanc */
function LogoThumb({ partenaire, className }: { partenaire: Partenaire; className?: string }) {
  return (
    <div className={cn('relative h-11 w-16 shrink-0 overflow-hidden rounded-md border bg-white', className)}>
      <Image src={partenaire.logo} alt="" fill sizes="64px" className="object-contain p-1.5" />
    </div>
  )
}

/** Menu d'actions d'un partenaire (commun aux vues bureau et mobile) */
function PartenaireActions({ partenaire, onDelete, onTogglePublished }: {
  partenaire: Partenaire
  onDelete: () => void
  onTogglePublished: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
          <MoreHorizontal />
          <span className="sr-only">Actions pour {partenaire.nom}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/partenaires/${partenaire.id}`}>
            <Edit className="mr-2 size-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        {partenaire.site && (
          <DropdownMenuItem asChild>
            <a href={partenaire.site} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Voir le site
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onTogglePublished}>
          {partenaire.published ? (
            <>
              <EyeOff className="mr-2 size-4" />
              Dépublier
            </>
          ) : (
            <>
              <Eye className="mr-2 size-4" />
              Publier
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:bg-red-50 focus:text-red-700">
          <Trash2 className="mr-2 size-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
    <tr
      ref={setNodeRef}
      style={style}
      data-state={isSelected ? 'selected' : undefined}
      className={cn(
        'bg-card transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary-50/50',
        isDragging && 'relative z-10 shadow-sm'
      )}
    >
      <td className="w-10 py-3 pl-4 pr-1 align-middle">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner ${partenaire.nom}`}
          className="rounded-[4px]"
        />
      </td>
      <td className="w-10 px-1 py-3 align-middle">
        <div
          {...attributes}
          {...listeners}
          aria-label={`Déplacer ${partenaire.nom}`}
          className="flex size-8 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex items-center gap-3">
          <LogoThumb partenaire={partenaire} />
          <div className="min-w-0">
            <Link
              href={`/admin/partenaires/${partenaire.id}`}
              className="block truncate font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {partenaire.nom}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{partenaire.categorie}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 align-middle text-sm text-muted-foreground lg:table-cell">
        {partenaire.typePartenariat}
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={partenaire.published ? 'published' : 'draft'} />
          {partenaire.partenaire_majeur && <StatusBadge status="featured" />}
        </div>
      </td>
      <td className="hidden px-3 py-3 text-center align-middle text-sm tabular-nums text-muted-foreground lg:table-cell">
        {partenaire.ordre}
      </td>
      <td className="py-3 pl-3 pr-4 text-right align-middle">
        <PartenaireActions partenaire={partenaire} onDelete={onDelete} onTogglePublished={onTogglePublished} />
      </td>
    </tr>
  )
}

// Ligne de la vue mobile
function PartenaireItem({ partenaire, onDelete, onTogglePublished }: {
  partenaire: Partenaire
  onDelete: () => void
  onTogglePublished: () => void
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <LogoThumb partenaire={partenaire} className="h-12 w-[4.5rem]" />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/partenaires/${partenaire.id}`} className="block truncate text-sm font-medium">
          {partenaire.nom}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{partenaire.categorie}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <StatusBadge status={partenaire.published ? 'published' : 'draft'} />
          {partenaire.partenaire_majeur && <StatusBadge status="featured" />}
        </div>
      </div>
      <PartenaireActions partenaire={partenaire} onDelete={onDelete} onTogglePublished={onTogglePublished} />
    </li>
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

  const allSelected = selectedIds.length === partenaires.length && partenaires.length > 0

  if (partenaires.length === 0) {
    return (
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Handshake className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-base font-semibold">Aucun partenaire</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ajoutez les entreprises et institutions qui soutiennent le club.
        </p>
        <Button asChild className="mt-5">
          <Link href="/admin/partenaires/new">
            <Plus />
            Nouveau partenaire
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* Barre d'état : sélection ou aide au réordonnancement */}
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-sm font-medium">
                {selectedIds.length} partenaire{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  Annuler
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
                  <Trash2 />
                  Supprimer
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''}
              </span>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
                <GripVertical className="size-3.5" />
                Glissez les lignes pour modifier l&apos;ordre d&apos;affichage
              </span>
            </>
          )}
        </div>

        {/* Vue mobile : liste */}
        <ul className="divide-y md:hidden">
          {partenaires.map((partenaire) => (
            <PartenaireItem
              key={partenaire.id}
              partenaire={partenaire}
              onDelete={() => setDeleteId(partenaire.id)}
              onTogglePublished={() => handleTogglePublished(partenaire.id)}
            />
          ))}
        </ul>

        {/* Vue bureau : tableau réordonnable par glisser-déposer */}
        <div className="hidden md:block">
          <DndContext
            id="partenaires-ordre"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="h-10 w-10 py-0 pl-4 pr-1 align-middle">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Tout sélectionner"
                      className="rounded-[4px]"
                    />
                  </th>
                  <th className="w-10 px-1">
                    <span className="sr-only">Ordre</span>
                  </th>
                  <th className={headCell}>Partenaire</th>
                  <th className={cn(headCell, 'hidden lg:table-cell')}>Type</th>
                  <th className={headCell}>Statut</th>
                  <th className={cn(headCell, 'hidden text-center lg:table-cell')}>Ordre</th>
                  <th className={cn(headCell, 'pr-4 text-right')}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
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
              </tbody>
            </table>
          </DndContext>
        </div>
      </Card>

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
