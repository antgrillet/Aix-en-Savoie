'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Eye, EyeOff, GripVertical, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/admin/Button'
import { Thumb } from '@/components/admin/DataList'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { Checkbox } from '@/components/admin/Field'
import { FilterBar, FilterGroup, SearchField } from '@/components/admin/FilterBar'
import { SaveBar } from '@/components/admin/FormSection'
import { RowActions, type RowAction } from '@/components/admin/RowActions'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'
import { deletePartenaire, togglePublished, deleteMultiplePartenaires, updateOrdre } from './actions'
import type { Partenaire } from '@/generated/prisma/client'

interface PartenairesListProps {
  initialPartenaires: Partenaire[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'majeur', label: 'Majeurs' },
] as const

const INSTRUCTIONS_DEPLACEMENT = {
  draggable:
    'Pour déplacer ce partenaire, appuyez sur Espace ou Entrée. Utilisez ensuite les flèches haut et bas, puis Espace ou Entrée pour le poser, ou Échap pour annuler.',
}

function accorder(nombre: number, singulier: string, pluriel: string) {
  return nombre > 1 ? pluriel : singulier
}

/** Marques de statut d'un partenaire : publié ou brouillon, puis « Majeur » */
function Marques({ partenaire }: { partenaire: Partenaire }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={partenaire.published ? 'published' : 'draft'} />
      {partenaire.partenaire_majeur && (
        <StatusMark tone="fill" icon={Star}>
          Majeur
        </StatusMark>
      )}
    </span>
  )
}

interface RowProps {
  partenaire: Partenaire
  actions: (RowAction | 'separator')[]
}

interface SortableRowProps extends RowProps {
  isSelected: boolean
  onToggleSelect: () => void
  /** L'ordre ne se change que sur la liste complète */
  canReorder: boolean
}

/** Ligne du tableau (grand écran) : case de sélection, poignée d'ordre, contenu */
function SortableRow({ partenaire, actions, isSelected, onToggleSelect, canReorder }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: partenaire.id,
      disabled: !canReorder,
      attributes: { roleDescription: 'ligne déplaçable' },
    })

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'relative z-10 bg-background opacity-60' : undefined}
    >
      <td>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner ${partenaire.nom}`}
        />
      </td>
      <td>
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canReorder}
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Déplacer ${partenaire.nom}`}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </td>
      <td>
        <Thumb src={partenaire.logo} fit="contain" />
      </td>
      <td>
        <Link
          href={`/admin/partenaires/${partenaire.id}`}
          className="line-clamp-2 font-semibold decoration-1 underline-offset-4 hover:underline"
        >
          {partenaire.nom}
        </Link>
        <span className="adm-meta block lg:hidden">{partenaire.categorie}</span>
      </td>
      <td className="hidden lg:table-cell">{partenaire.categorie}</td>
      <td className="hidden xl:table-cell">{partenaire.typePartenariat}</td>
      <td>
        <Marques partenaire={partenaire} />
      </td>
      <td className="hidden text-right lg:table-cell">
        <span className="adm-num-sm">{partenaire.ordre}</span>
      </td>
      <td className="text-right">
        <RowActions label={`Actions pour « ${partenaire.nom} »`} items={actions} />
      </td>
    </tr>
  )
}

/** Ligne empilée (téléphone) : toute la ligne ouvre la fiche */
function PhoneRow({ partenaire, actions }: RowProps) {
  return (
    <li className="relative flex gap-3 py-3">
      <div className="shrink-0 pt-0.5">
        <Thumb src={partenaire.logo} fit="contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-snug">
          <Link href={`/admin/partenaires/${partenaire.id}`} className="adm-row-link line-clamp-2">
            {partenaire.nom}
          </Link>
        </div>
        <div className="adm-meta mt-0.5 flex flex-wrap gap-x-2">
          <span>
            <span className="sr-only">Catégorie : </span>
            {partenaire.categorie}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="sr-only">Type de partenariat : </span>
            {partenaire.typePartenariat}
          </span>
        </div>
        <div className="mt-2">
          <Marques partenaire={partenaire} />
        </div>
      </div>
      <div className="relative z-10 -mr-2 -mt-1.5 shrink-0">
        <RowActions label={`Actions pour « ${partenaire.nom} »`} items={actions} />
      </div>
    </li>
  )
}

export function PartenairesList({ initialPartenaires }: PartenairesListProps) {
  const [partenaires, setPartenaires] = useState(initialPartenaires)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  // Nombre de partenaires visés par la suppression groupée, figé à l'ouverture
  // du dialogue : le texte ne change pas pendant qu'il se referme.
  const [bulkCount, setBulkCount] = useState(0)
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  // Filtres
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Catégories réellement utilisées par les partenaires
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(initialPartenaires.map((p) => p.categorie))).sort((a, b) =>
      a.localeCompare(b, 'fr')
    )
    return [
      { value: 'all', label: 'Toutes catégories' },
      ...categories.map((categorie) => ({ value: categorie, label: categorie })),
    ]
  }, [initialPartenaires])

  const filteredPartenaires = useMemo(() => {
    return partenaires.filter((partenaire) => {
      const matchesSearch =
        search === '' || partenaire.nom.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || partenaire.categorie === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && partenaire.published) ||
        (statusFilter === 'draft' && !partenaire.published) ||
        (statusFilter === 'majeur' && partenaire.partenaire_majeur)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [partenaires, search, categoryFilter, statusFilter])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters = search !== '' || categoryFilter !== 'all' || statusFilter !== 'all'

  // La sélection ne porte que sur les lignes affichées : on ne supprime
  // jamais un partenaire masqué par un filtre.
  const selection = selectedIds.filter((id) => filteredPartenaires.some((p) => p.id === id))
  const allSelected = filteredPartenaires.length > 0 && selection.length === filteredPartenaires.length

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deletePartenaire(deleteId)
      setPartenaires(partenaires.filter((p) => p.id !== deleteId))
      setSelectedIds(selectedIds.filter((id) => id !== deleteId))
      toast.success('Partenaire supprimé')
      setDeleteId(null)
    } catch {
      toast.error("Le partenaire n'a pas pu être supprimé. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublished = async (partenaire: Partenaire) => {
    try {
      await togglePublished(partenaire.id)
      setPartenaires(
        partenaires.map((p) => (p.id === partenaire.id ? { ...p, published: !p.published } : p))
      )
      toast.success(partenaire.published ? 'Partenaire repassé en brouillon' : 'Partenaire publié')
    } catch {
      toast.error("Le statut n'a pas pu être modifié. Réessayez dans un instant.")
    }
  }

  const handleBulkDelete = async () => {
    if (selection.length === 0) return

    setIsDeleting(true)
    try {
      await deleteMultiplePartenaires(selection)
      setPartenaires(partenaires.filter((p) => !selection.includes(p.id)))
      toast.success(
        `${selection.length} ${accorder(selection.length, 'partenaire supprimé', 'partenaires supprimés')}`
      )
      setSelectedIds([])
      setShowBulkDelete(false)
    } catch {
      toast.error("La sélection n'a pas pu être supprimée. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : filteredPartenaires.map((p) => p.id))
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = partenaires.findIndex((p) => p.id === active.id)
    const newIndex = partenaires.findIndex((p) => p.id === over.id)

    // Le rang de chaque partenaire devient sa place dans la liste
    const newPartenaires = arrayMove(partenaires, oldIndex, newIndex).map((partenaire, index) => ({
      ...partenaire,
      ordre: index,
    }))

    // Mettre à jour l'ordre local immédiatement
    setPartenaires(newPartenaires)

    try {
      await updateOrdre(newPartenaires.map(({ id, ordre }) => ({ id, ordre })))
      toast.success('Ordre enregistré')
    } catch {
      // Restaurer l'ancien ordre en cas d'erreur
      setPartenaires(partenaires)
      toast.error("L'ordre n'a pas pu être enregistré. Réessayez dans un instant.")
    }
  }

  // Annonces du déplacement pour les lecteurs d'écran
  const nomDe = (id: UniqueIdentifier) => partenaires.find((p) => p.id === id)?.nom ?? 'Le partenaire'
  const rangDe = (id: UniqueIdentifier) => partenaires.findIndex((p) => p.id === id) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nomDe(active.id)} saisi.`,
    onDragOver: ({ active, over }) =>
      over ? `${nomDe(active.id)} placé au rang ${rangDe(over.id)} sur ${partenaires.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${nomDe(active.id)} posé au rang ${rangDe(over.id)} sur ${partenaires.length}.`
        : `${nomDe(active.id)} reposé à sa place.`,
    onDragCancel: ({ active }) => `Déplacement annulé : ${nomDe(active.id)} retrouve sa place.`,
  }

  const actionsFor = (partenaire: Partenaire): (RowAction | 'separator')[] => [
    { label: 'Modifier', icon: Pencil, href: `/admin/partenaires/${partenaire.id}` },
    ...(partenaire.site
      ? [{ label: 'Voir le site du partenaire', icon: ExternalLink, href: partenaire.site, external: true }]
      : []),
    {
      label: partenaire.published ? 'Dépublier' : 'Publier',
      icon: partenaire.published ? EyeOff : Eye,
      onSelect: () => handleTogglePublished(partenaire),
    },
    'separator',
    {
      label: 'Supprimer',
      icon: Trash2,
      destructive: true,
      onSelect: () => setDeleteId(partenaire.id),
    },
  ]

  return (
    <>
      <FilterBar
        label="Filtrer les partenaires"
        onReset={hasActiveFilters ? clearFilters : undefined}
        count={{
          shown: filteredPartenaires.length,
          total: partenaires.length,
          singular: 'partenaire',
          plural: 'partenaires',
        }}
      >
        <SearchField
          value={search}
          onChange={setSearch}
          label="Rechercher un partenaire par son nom"
          placeholder="Rechercher un nom"
        />
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

      {filteredPartenaires.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="Aucun partenaire ne correspond"
            action={
              <Button type="button" variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            }
          >
            <p>Élargissez la recherche ou retirez un filtre pour retrouver les autres partenaires.</p>
          </EmptyState>
        ) : (
          <EmptyState
            title="Aucun partenaire pour l'instant"
            action={
              <Button asChild>
                <Link href="/admin/partenaires/new">
                  <Plus aria-hidden="true" />
                  Ajouter le premier partenaire
                </Link>
              </Button>
            }
          >
            <p>
              Un partenaire, c'est un nom, un logo et quelques lignes de présentation. Une fois publié,
              il apparaît sur la page Partenaires du site, et sur l'accueil s'il est partenaire majeur.
            </p>
          </EmptyState>
        )
      ) : (
        <>
          {/* Grand écran : tableau, lignes à sélectionner et à réordonner */}
          <div className="hidden md:block">
            <DndContext
              id="partenaires-ordre"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              accessibility={{ announcements, screenReaderInstructions: INSTRUCTIONS_DEPLACEMENT }}
            >
              <table className="adm-table">
                <caption className="sr-only">Partenaires</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-9">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Sélectionner tous les partenaires affichés"
                      />
                    </th>
                    <th scope="col" className="w-12">
                      <span className="sr-only">Déplacer</span>
                    </th>
                    <th scope="col" className="w-16">
                      <span className="sr-only">Logo</span>
                    </th>
                    <th scope="col">Nom</th>
                    <th scope="col" className="hidden lg:table-cell">
                      Catégorie
                    </th>
                    <th scope="col" className="hidden xl:table-cell">
                      Type
                    </th>
                    <th scope="col">Statut</th>
                    <th scope="col" className="hidden text-right lg:table-cell">
                      Ordre
                    </th>
                    <th scope="col" className="w-12">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={filteredPartenaires.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredPartenaires.map((partenaire) => (
                      <SortableRow
                        key={partenaire.id}
                        partenaire={partenaire}
                        actions={actionsFor(partenaire)}
                        isSelected={selection.includes(partenaire.id)}
                        onToggleSelect={() => toggleSelectOne(partenaire.id)}
                        canReorder={!hasActiveFilters}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>

            <p className="adm-meta mt-3 max-w-[75ch]">
              {hasActiveFilters
                ? "L'ordre se change sur la liste complète : effacez les filtres pour déplacer une ligne."
                : "Pour changer l'ordre d'affichage sur le site, faites glisser une ligne par sa poignée. Au clavier : Espace sur la poignée, les flèches haut et bas, puis Espace pour poser."}
            </p>
          </div>

          {/* Téléphone : lignes empilées */}
          <ul className="adm-rows border-t border-foreground md:hidden" aria-label="Partenaires">
            {filteredPartenaires.map((partenaire) => (
              <PhoneRow key={partenaire.id} partenaire={partenaire} actions={actionsFor(partenaire)} />
            ))}
          </ul>
        </>
      )}

      {selection.length > 0 && (
        <SaveBar
          className="mt-6 hidden md:flex"
          status={
            <p role="status">
              <span className="adm-num-sm text-foreground">{selection.length}</span>{' '}
              {accorder(selection.length, 'partenaire sélectionné', 'partenaires sélectionnés')}
            </p>
          }
        >
          <Button type="button" variant="outline" onClick={() => setSelectedIds([])}>
            Annuler la sélection
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBulkCount(selection.length)
              setShowBulkDelete(true)
            }}
          >
            <Trash2 aria-hidden="true" />
            Supprimer la sélection
          </Button>
        </SaveBar>
      )}

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce partenaire ?"
        description="Cette action est irréversible. Le partenaire et son logo seront définitivement supprimés."
        confirmLabel="Supprimer le partenaire"
      />

      <DeleteDialog
        open={showBulkDelete}
        onOpenChange={(open) => !open && setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        title={`Supprimer ${bulkCount} ${accorder(bulkCount, 'partenaire', 'partenaires')} ?`}
        description={`Cette action est irréversible. ${accorder(
          bulkCount,
          'Le partenaire sélectionné et son logo seront définitivement supprimés.',
          `Les ${bulkCount} partenaires sélectionnés et leurs logos seront définitivement supprimés.`
        )}`}
        confirmLabel={accorder(bulkCount, 'Supprimer le partenaire', 'Supprimer les partenaires')}
      />
    </>
  )
}
