'use client'

import Link from 'next/link'
import { GripVertical, Home } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/admin/Button'
import { Thumb } from '@/components/admin/DataList'
import { Checkbox } from '@/components/admin/Field'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'
import type { Equipe, Entrainement } from '@/generated/prisma/client'

export type EquipeRow = Equipe & { entrainements: Entrainement[] }

interface SortableEquipesProps {
  /** Équipes affichées, dans l'ordre du site */
  equipes: EquipeRow[]
  selectedIds: number[]
  allSelected: boolean
  onToggleSelectAll: () => void
  onToggleSelect: (id: number) => void
  onDragEnd: (event: DragEndEvent) => void
  /** Menu d'actions de la ligne (`RowActions`) */
  actions: (equipe: EquipeRow) => React.ReactNode
}

/** Une ligne ne se déplace que de haut en bas : pas de défilement horizontal pendant le geste */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 })

const INSTRUCTIONS = {
  draggable:
    "Pour déplacer une équipe, appuyez sur Espace ou Entrée, utilisez les flèches haut et bas, puis appuyez de nouveau sur Espace ou Entrée pour la poser. Échap annule le déplacement.",
}

/**
 * Liste des équipes : tableau à partir de `md`, lignes empilées en dessous.
 * Reprend le dessin de `DataList` (mêmes classes `adm-table` et `adm-rows`) en
 * y ajoutant ce que `DataList` ne sait pas faire : la sélection de lignes et
 * l'ordre par glisser-déposer.
 */
export function SortableEquipes({
  equipes,
  selectedIds,
  allSelected,
  onToggleSelectAll,
  onToggleSelect,
  onDragEnd,
  actions,
}: SortableEquipesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const ids = equipes.map((equipe) => equipe.id)
  const nom = (id: UniqueIdentifier) => equipes.find((equipe) => equipe.id === id)?.nom ?? 'L\'équipe'
  const rang = (id: UniqueIdentifier) => ids.indexOf(Number(id)) + 1

  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nom(active.id)} : déplacement commencé, position ${rang(active.id)} sur ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nom(active.id)} : position ${rang(over.id)} sur ${ids.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${nom(active.id)} posée en position ${rang(over.id)} sur ${ids.length}.` : undefined,
    onDragCancel: ({ active }) => `Déplacement annulé : ${nom(active.id)} reprend sa place.`,
  }

  // Les deux présentations sont montées en même temps (une seule est visible) :
  // chacune a son propre contexte de déplacement.
  const dnd = {
    sensors,
    collisionDetection: closestCenter,
    onDragEnd,
    modifiers: [verticalOnly],
    accessibility: { announcements, screenReaderInstructions: INSTRUCTIONS },
  }

  return (
    <div>
      {/* Grand écran : tableau */}
      <DndContext id="equipes-tableau" {...dnd}>
        <table className="adm-table hidden md:table">
          <caption className="sr-only">Équipes</caption>
          <thead>
            <tr>
              <th scope="col" className="w-9">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Sélectionner toutes les équipes"
                />
              </th>
              <th scope="col" className="w-11">
                <span className="sr-only">Déplacer</span>
              </th>
              <th scope="col" className="w-16">
                <span className="sr-only">Photo</span>
              </th>
              <th scope="col">Nom</th>
              <th scope="col" className="hidden lg:table-cell">
                Entraîneur
              </th>
              <th scope="col" className="hidden w-24 text-right xl:table-cell">
                Créneaux
              </th>
              <th scope="col" className="xl:pl-6">
                Statut
              </th>
              <th scope="col" className="hidden w-20 text-right xl:table-cell">
                Ordre
              </th>
              <th scope="col" className="w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {equipes.map((equipe) => (
                <TableRow
                  key={equipe.id}
                  equipe={equipe}
                  isSelected={selectedIds.includes(equipe.id)}
                  onToggleSelect={() => onToggleSelect(equipe.id)}
                  actions={actions(equipe)}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>

      {/* Téléphone : lignes empilées */}
      <div className="md:hidden">
        <div className="flex min-h-11 items-center gap-3 border-b border-foreground">
          <Checkbox
            id="equipes-tout-selectionner"
            checked={allSelected}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="equipes-tout-selectionner" className="adm-meta cursor-pointer">
            Tout sélectionner
          </label>
        </div>
        <DndContext id="equipes-lignes" {...dnd}>
          <ul className="adm-rows" aria-label="Équipes">
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {equipes.map((equipe) => (
                <PhoneRow
                  key={equipe.id}
                  equipe={equipe}
                  isSelected={selectedIds.includes(equipe.id)}
                  onToggleSelect={() => onToggleSelect(equipe.id)}
                  actions={actions(equipe)}
                />
              ))}
            </SortableContext>
          </ul>
        </DndContext>
      </div>
    </div>
  )
}

interface RowProps {
  equipe: EquipeRow
  isSelected: boolean
  onToggleSelect: () => void
  actions: React.ReactNode
}

function creneaux(equipe: EquipeRow) {
  const count = equipe.entrainements.length
  return `${count} créneau${count > 1 ? 'x' : ''}`
}

function Marks({ equipe }: { equipe: EquipeRow }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5 md:flex-nowrap">
      <StatusBadge status={equipe.published ? 'published' : 'draft'} />
      {equipe.featured && (
        <StatusMark tone="fill" icon={Home}>
          Accueil
        </StatusMark>
      )}
    </span>
  )
}

const HANDLE_CLASSES = 'cursor-grab touch-none text-muted-foreground active:cursor-grabbing'

function TableRow({ equipe, isSelected, onToggleSelect, actions }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: equipe.id, attributes: { roleDescription: 'ligne déplaçable' } })

  const style = { transform: CSS.Translate.toString(transform), transition }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'relative z-10 bg-background [&>td]:border-foreground')}
    >
      <td>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner « ${equipe.nom} »`}
        />
      </td>
      <td>
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon"
          className={HANDLE_CLASSES}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer « ${equipe.nom} »`}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </td>
      <td>
        <Thumb src={equipe.photo} />
      </td>
      <td>
        <Link
          href={`/admin/equipes/${equipe.id}`}
          className="line-clamp-2 font-semibold decoration-1 underline-offset-4 hover:underline"
        >
          {equipe.nom}
        </Link>
        <span className="adm-meta block">
          <span className="sr-only">Catégorie : </span>
          {equipe.categorie}
          <span className="lg:hidden"> · {equipe.entraineur}</span>
        </span>
      </td>
      <td className="hidden lg:table-cell">{equipe.entraineur}</td>
      <td className="hidden text-right xl:table-cell">
        <span className="adm-num-sm">{equipe.entrainements.length}</span>
        <span className="sr-only"> {equipe.entrainements.length > 1 ? 'créneaux' : 'créneau'}</span>
      </td>
      <td className="xl:pl-6">
        <Marks equipe={equipe} />
      </td>
      <td className="hidden text-right xl:table-cell">
        <span className="adm-num-sm">{equipe.ordre}</span>
      </td>
      <td className="text-right">{actions}</td>
    </tr>
  )
}

function PhoneRow({ equipe, isSelected, onToggleSelect, actions }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: equipe.id, attributes: { roleDescription: 'ligne déplaçable' } })

  const style = { transform: CSS.Translate.toString(transform), transition }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex gap-3 bg-background py-3',
        isDragging && 'z-10 border-b-foreground'
      )}
    >
      <div className="relative z-10 shrink-0 pt-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Sélectionner « ${equipe.nom} »`}
        />
      </div>
      <div className="shrink-0 pt-0.5">
        <Thumb src={equipe.photo} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-snug">
          <Link
            href={`/admin/equipes/${equipe.id}`}
            className="adm-row-link line-clamp-2 decoration-1 underline-offset-4 hover:underline"
          >
            {equipe.nom}
          </Link>
        </div>
        <p className="adm-meta mt-0.5">
          <span className="sr-only">Catégorie : </span>
          {equipe.categorie}
          <span aria-hidden="true"> · </span>
          {creneaux(equipe)}
        </p>
        <p className="adm-meta">
          <span className="sr-only">Entraîneur : </span>
          {equipe.entraineur}
        </p>
        <div className="mt-2">
          <Marks equipe={equipe} />
        </div>
      </div>
      <div className="relative z-10 -mr-2 -mt-1.5 flex shrink-0 flex-col">
        {actions}
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon"
          className={HANDLE_CLASSES}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer « ${equipe.nom} »`}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
