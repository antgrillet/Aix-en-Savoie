'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteEquipe, togglePublished, deleteMultipleEquipes, updateOrdre } from './actions'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { Equipe, Entrainement } from '@/generated/prisma/client'

interface EquipesListProps {
  initialEquipes: (Equipe & { entrainements: Entrainement[] })[]
}

/** Pastille « Accueil » : équipe dont les matchs sont mis en avant sur la page d'accueil */
function FeaturedPill() {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-600/25"
      title="Matchs affichés sur la page d'accueil"
    >
      Accueil
    </span>
  )
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

  const genre = equipe.genre === 'FEMININ' ? 'Féminin' : 'Masculin'
  const creneaux = equipe.entrainements.length

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card transition-colors hover:bg-muted/40',
        isSelected && 'bg-muted/60',
        isDragging && 'relative z-10'
      )}
    >
      <td className="w-10 py-3 pl-4 pr-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner ${equipe.nom}`}
          className="translate-y-0.5 rounded-[4px]"
        />
      </td>
      <td className="w-10 px-1 py-3">
        <div
          {...attributes}
          {...listeners}
          aria-label={`Déplacer ${equipe.nom}`}
          className="flex size-8 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>
      </td>
      <td className="px-2 py-3 sm:px-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md bg-muted sm:h-12 sm:w-16">
            <Image src={equipe.photo} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/equipes/${equipe.id}`}
              className="line-clamp-1 rounded-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {equipe.nom}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {equipe.categorie} · {genre}
              <span className="lg:hidden"> · {equipe.entraineur}</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
              <StatusBadge status={equipe.published ? 'published' : 'draft'} />
              {equipe.featured && <FeaturedPill />}
            </div>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 text-muted-foreground lg:table-cell">{equipe.entraineur}</td>
      <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground xl:table-cell">
        {creneaux} créneau{creneaux > 1 ? 'x' : ''}
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={equipe.published ? 'published' : 'draft'} />
          {equipe.featured && <FeaturedPill />}
        </div>
      </td>
      <td className="px-2 py-3 text-right sm:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
              <MoreHorizontal />
              <span className="sr-only">Actions pour {equipe.nom}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/equipes/${equipe.id}`}>
                <Edit />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/equipes/${equipe.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Voir sur le site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onTogglePublished}>
              {equipe.published ? (
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
      </td>
    </tr>
  )
}

export function EquipesList({ initialEquipes }: EquipesListProps) {
  const [equipes, setEquipes] = useState(initialEquipes)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  // Filtres
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filtrer les équipes
  const filteredEquipes = useMemo(() => {
    return equipes.filter(equipe => {
      const matchesSearch = search === '' ||
        equipe.nom.toLowerCase().includes(search.toLowerCase()) ||
        equipe.entraineur.toLowerCase().includes(search.toLowerCase())
      const matchesGenre = genreFilter === 'all' || equipe.genre === genreFilter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'published' && equipe.published) ||
        (statusFilter === 'draft' && !equipe.published)
      return matchesSearch && matchesGenre && matchesStatus
    })
  }, [equipes, search, genreFilter, statusFilter])

  const clearFilters = () => {
    setSearch('')
    setGenreFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters = search !== '' || genreFilter !== 'all' || statusFilter !== 'all'

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      // Restaurer l'ancien ordre en cas d'erreur
      setEquipes(equipes)
      toast.error('Erreur lors de la mise à jour de l\'ordre')
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
              placeholder="Rechercher une équipe…"
              aria-label="Rechercher une équipe ou un entraîneur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 md:h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger aria-label="Filtrer par genre" className="h-10 md:h-9 md:w-40">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les genres</SelectItem>
                <SelectItem value="MASCULIN">Masculin</SelectItem>
                <SelectItem value="FEMININ">Féminin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filtrer par statut" className="h-10 md:h-9 md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiées</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
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

        {/* Actions groupées */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
            <span className="mr-auto text-sm font-medium">
              {selectedIds.length} équipe{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Annuler
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
              <Trash2 />
              Supprimer la sélection
            </Button>
          </div>
        )}

        {filteredEquipes.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Users className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {hasActiveFilters ? 'Aucune équipe trouvée' : 'Aucune équipe'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Modifiez la recherche ou les filtres.'
                : 'Les équipes créées apparaîtront ici.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            id="admin-equipes-ordre"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead className="hidden border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-header-group">
                <tr>
                  <th scope="col" className="w-10 py-3 pl-4 pr-1">
                    <Checkbox
                      checked={selectedIds.length === filteredEquipes.length && filteredEquipes.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Tout sélectionner"
                      className="translate-y-0.5 rounded-[4px]"
                    />
                  </th>
                  <th scope="col" className="w-10 px-1 py-3">
                    <span className="sr-only">Ordre</span>
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">Équipe</th>
                  <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">Entraîneur</th>
                  <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Entraînements</th>
                  <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">Statut</th>
                  <th scope="col" className="w-14 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <SortableContext
                  items={filteredEquipes.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredEquipes.map((equipe) => (
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
              </tbody>
            </table>
          </DndContext>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <span>
            {hasActiveFilters
              ? `${filteredEquipes.length} sur ${equipes.length} équipe${equipes.length > 1 ? 's' : ''}`
              : `${equipes.length} équipe${equipes.length > 1 ? 's' : ''}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <GripVertical className="size-3.5" />
            Glissez les lignes pour changer l'ordre d'affichage sur le site
          </span>
        </div>
      </Card>

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
