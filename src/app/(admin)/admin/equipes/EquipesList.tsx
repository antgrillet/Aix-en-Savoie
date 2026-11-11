'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Button } from '@/components/admin/Button'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { FilterBar, FilterGroup, SearchField } from '@/components/admin/FilterBar'
import { RowActions } from '@/components/admin/RowActions'
import { SimpleSelect } from '@/components/admin/Select'
import { deleteEquipe, togglePublished, deleteMultipleEquipes, updateOrdre } from './actions'
import { SortableEquipes, type EquipeRow } from './SortableEquipes'

interface EquipesListProps {
  initialEquipes: EquipeRow[]
}

const GENRE_OPTIONS = [
  { value: 'all', label: 'Tous genres' },
  { value: 'MASCULIN', label: 'Masculin' },
  { value: 'FEMININ', label: 'Féminin' },
] as const

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'published', label: 'Publiées' },
  { value: 'draft', label: 'Brouillons' },
] as const

const pluriel = (count: number) => (count > 1 ? 's' : '')

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
    return equipes.filter((equipe) => {
      const matchesSearch =
        search === '' ||
        equipe.nom.toLowerCase().includes(search.toLowerCase()) ||
        equipe.entraineur.toLowerCase().includes(search.toLowerCase())
      const matchesGenre = genreFilter === 'all' || equipe.genre === genreFilter
      const matchesStatus =
        statusFilter === 'all' ||
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

  // Équipes sélectionnées que les filtres en cours n'affichent pas : la barre
  // de sélection et la confirmation le disent avant une suppression
  const hiddenSelectedCount = selectedIds.filter(
    (id) =>
      equipes.some((equipe) => equipe.id === id) &&
      !filteredEquipes.some((equipe) => equipe.id === id)
  ).length

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteEquipe(deleteId)
      setEquipes(equipes.filter((e) => e.id !== deleteId))
      toast.success('Équipe supprimée')
      setDeleteId(null)
    } catch {
      toast.error("L'équipe n'a pas pu être supprimée. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublished = async (equipe: EquipeRow) => {
    try {
      await togglePublished(equipe.id)
      setEquipes(equipes.map((e) => (e.id === equipe.id ? { ...e, published: !e.published } : e)))
      toast.success(equipe.published ? 'Équipe repassée en brouillon' : 'Équipe publiée')
    } catch {
      toast.error("Le statut n'a pas pu être modifié. Réessayez dans un instant.")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      await deleteMultipleEquipes(selectedIds)
      setEquipes(equipes.filter((e) => !selectedIds.includes(e.id)))
      toast.success(
        `${selectedIds.length} équipe${pluriel(selectedIds.length)} supprimée${pluriel(selectedIds.length)}`
      )
      setSelectedIds([])
      setShowBulkDelete(false)
    } catch {
      toast.error("Les équipes n'ont pas pu être supprimées. Réessayez dans un instant.")
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
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
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
      toast.error("L'ordre n'a pas pu être enregistré. Réessayez dans un instant.")
    }
  }

  const selectionCount = selectedIds.length

  return (
    <>
      <FilterBar
        label="Filtrer les équipes"
        onReset={hasActiveFilters ? clearFilters : undefined}
        count={{
          shown: filteredEquipes.length,
          total: equipes.length,
          singular: 'équipe',
          plural: 'équipes',
        }}
      >
        <SearchField
          value={search}
          onChange={setSearch}
          label="Rechercher une équipe par son nom ou son entraîneur"
          placeholder="Rechercher une équipe"
        />
        <FilterGroup>
          <SimpleSelect
            value={genreFilter}
            onValueChange={setGenreFilter}
            options={GENRE_OPTIONS}
            aria-label="Genre"
            className="md:w-40"
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

      {selectionCount > 0 && (
        <div
          role="group"
          aria-label="Équipes sélectionnées"
          className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-foreground py-2"
        >
          <p className="mr-auto py-1 pr-2 font-semibold">
            <span className="adm-num-sm">{selectionCount}</span> équipe{pluriel(selectionCount)}{' '}
            sélectionnée{pluriel(selectionCount)}
            {hiddenSelectedCount > 0 && (
              <span className="adm-meta font-normal">
                , dont {hiddenSelectedCount} masquée{pluriel(hiddenSelectedCount)} par les filtres
              </span>
            )}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Annuler la sélection
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            className="border-destructive text-destructive hover:border-destructive hover:bg-destructive hover:text-white active:border-destructive active:bg-destructive active:text-white"
          >
            <Trash2 aria-hidden="true" />
            Supprimer la sélection
          </Button>
        </div>
      )}

      {filteredEquipes.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="Aucune équipe ne correspond"
            action={
              <Button type="button" variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            }
          >
            <p>Élargissez la recherche ou retirez un filtre pour retrouver les autres équipes.</p>
          </EmptyState>
        ) : (
          <EmptyState
            title="Aucune équipe pour l'instant"
            action={
              <Button asChild>
                <Link href="/admin/equipes/new">
                  <Plus aria-hidden="true" />
                  Créer la première équipe
                </Link>
              </Button>
            }
          >
            <p>
              Une équipe a sa page sur le site : photo, entraîneur, créneaux d'entraînement et
              matchs. À l'enregistrement, vous choisissez de la publier ou de la garder en
              brouillon.
            </p>
          </EmptyState>
        )
      ) : (
        <SortableEquipes
          equipes={filteredEquipes}
          selectedIds={selectedIds}
          allSelected={selectedIds.length === filteredEquipes.length && filteredEquipes.length > 0}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelectOne}
          onDragEnd={handleDragEnd}
          actions={(equipe) => (
            <RowActions
              label={`Actions pour « ${equipe.nom} »`}
              items={[
                { label: 'Modifier', icon: Pencil, href: `/admin/equipes/${equipe.id}` },
                {
                  label: equipe.published ? 'Dépublier' : 'Publier',
                  icon: equipe.published ? EyeOff : Eye,
                  onSelect: () => handleTogglePublished(equipe),
                },
                'separator',
                {
                  label: 'Supprimer',
                  icon: Trash2,
                  destructive: true,
                  onSelect: () => setDeleteId(equipe.id),
                },
              ]}
            />
          )}
        />
      )}

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cette équipe ?"
        description="Cette action est irréversible. L'équipe, ses créneaux d'entraînement, ses matchs et son classement seront définitivement supprimés."
        confirmLabel="Supprimer l'équipe"
      />

      <DeleteDialog
        open={showBulkDelete}
        onOpenChange={(open) => !open && setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        title={`Supprimer ${selectionCount} équipe${pluriel(selectionCount)} ?`}
        description={`Cette action est irréversible. ${selectionCount} équipe${pluriel(selectionCount)}, avec ${selectionCount > 1 ? 'leurs' : 'ses'} créneaux d'entraînement, ${selectionCount > 1 ? 'leurs' : 'ses'} matchs et ${selectionCount > 1 ? 'leur' : 'son'} classement, ${selectionCount > 1 ? 'seront définitivement supprimées' : 'sera définitivement supprimée'}.${
          hiddenSelectedCount > 0
            ? ` Attention : ${hiddenSelectedCount} équipe${pluriel(hiddenSelectedCount)} sélectionnée${pluriel(hiddenSelectedCount)} ${hiddenSelectedCount > 1 ? 'ne sont pas affichées' : "n'est pas affichée"} avec les filtres en cours.`
            : ''
        }`}
        confirmLabel={`Supprimer ${selectionCount > 1 ? `les ${selectionCount} équipes` : "l'équipe"}`}
      />
    </>
  )
}
