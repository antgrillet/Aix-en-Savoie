'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { DataList, type DataColumn } from '@/components/admin/DataList'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { FilterBar, FilterGroup } from '@/components/admin/FilterBar'
import { Section } from '@/components/admin/PageHeader'
import { RowActions } from '@/components/admin/RowActions'
import { SimpleSelect } from '@/components/admin/Select'
import { deleteInscription } from './actions'
import { formatDateCourte, formatHeure, formatJour } from './format'

interface Inscription {
  id: number
  nom: string
  prenom: string
  role: string
  createdAt: Date
  match: {
    id: number
    date: Date
    adversaire: string
    domicile: boolean
    equipe: {
      id: number
      nom: string
      categorie: string
    }
  }
}

export interface WeekendInscriptions {
  cle: string
  /** « Cette semaine », « Week-end du 27 au 29 novembre » */
  titre: string
  /** Dates du week-end, quand le titre ne les donne pas */
  periode?: string
  inscriptions: Inscription[]
}

interface InscriptionsTableProps {
  weekends: WeekendInscriptions[]
}

const ROLES: Record<string, string> = {
  TABLE_DE_MARQUE: 'Table de marque',
  ARBITRE: 'Arbitre',
  RESPONSABLE_SALLE: 'Responsable de salle',
  BUVETTE: 'Buvette',
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'Tous postes' },
  ...Object.entries(ROLES).map(([value, label]) => ({ value, label })),
]

// Largeurs fixes : les colonnes restent alignées d'une semaine à l'autre
const columns: DataColumn<Inscription>[] = [
  {
    id: 'benevole',
    header: 'Bénévole',
    className: 'w-[26%]',
    phone: 'title',
    cell: (inscription) => (
      <>
        <span className="font-semibold">
          {inscription.prenom} {inscription.nom}
        </span>
        <span className="adm-meta block font-normal md:hidden">
          {inscription.match.equipe.nom} – {inscription.match.adversaire}
        </span>
      </>
    ),
  },
  {
    id: 'poste',
    header: 'Poste',
    className: 'w-[20%]',
    cell: (inscription) => ROLES[inscription.role] ?? inscription.role,
  },
  {
    id: 'match',
    header: 'Match',
    phone: 'hidden',
    cell: (inscription) => (
      <>
        <span className="block font-medium">
          {inscription.match.equipe.nom} – {inscription.match.adversaire}
        </span>
        <span className="adm-meta block">{inscription.match.equipe.categorie}</span>
      </>
    ),
  },
  {
    id: 'date',
    header: 'Date',
    className: 'w-28 whitespace-nowrap',
    cell: (inscription) => (
      <span>
        <span className="md:block md:text-[0.8125rem] md:font-semibold md:text-foreground">
          {formatJour(inscription.match.date)}
        </span>
        <span className="md:hidden"> · </span>
        <span className="md:block md:text-[0.8125rem] md:text-muted-foreground">
          {formatHeure(inscription.match.date)}
        </span>
      </span>
    ),
  },
  {
    id: 'inscription',
    header: 'Inscrit le',
    className: 'hidden w-44 whitespace-nowrap xl:table-cell',
    phone: 'hidden',
    cell: (inscription) => (
      <span className="adm-meta">
        {formatDateCourte(inscription.createdAt)}, {formatHeure(inscription.createdAt)}
      </span>
    ),
  },
]

/**
 * Les bénévoles inscrits aux matchs à domicile à venir, semaine par semaine,
 * avec leurs filtres. Une inscription se retire depuis le menu de sa ligne.
 */
export function InscriptionsTable({ weekends }: InscriptionsTableProps) {
  const [filterEquipe, setFilterEquipe] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Uniquement les matchs à domicile
  const groupes = useMemo(
    () =>
      weekends.map((weekend) => ({
        ...weekend,
        inscriptions: weekend.inscriptions.filter((inscription) => inscription.match.domicile),
      })),
    [weekends]
  )

  const total = groupes.reduce((somme, groupe) => somme + groupe.inscriptions.length, 0)

  // Extraire les équipes uniques
  const equipeOptions = useMemo(() => {
    const equipes = new Map<number, string>()
    groupes.forEach((groupe) =>
      groupe.inscriptions.forEach((inscription) =>
        equipes.set(inscription.match.equipe.id, inscription.match.equipe.nom)
      )
    )
    return [
      { value: 'all', label: 'Toutes équipes' },
      ...Array.from(equipes, ([id, nom]) => ({ value: id.toString(), label: nom })),
    ]
  }, [groupes])

  // Filtrer les inscriptions
  const groupesFiltres = groupes
    .map((groupe) => ({
      ...groupe,
      inscriptions: groupe.inscriptions.filter((inscription) => {
        if (filterEquipe !== 'all' && inscription.match.equipe.id !== parseInt(filterEquipe)) {
          return false
        }
        if (filterRole !== 'all' && inscription.role !== filterRole) {
          return false
        }
        return true
      }),
    }))
    .filter((groupe) => groupe.inscriptions.length > 0)

  const shown = groupesFiltres.reduce((somme, groupe) => somme + groupe.inscriptions.length, 0)
  const hasActiveFilters = filterEquipe !== 'all' || filterRole !== 'all'

  const clearFilters = () => {
    setFilterEquipe('all')
    setFilterRole('all')
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await deleteInscription(deleteId)
      toast.success('Inscription supprimée')
      setDeleteId(null)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error("L'inscription n'a pas pu être supprimée. Réessayez dans un instant.")
    } finally {
      setDeleting(false)
    }
  }

  if (total === 0) {
    return (
      <EmptyState
        title="Aucun bénévole inscrit pour l'instant"
        action={
          <Button asChild variant="outline">
            <a href="/calendrier" target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              Voir le calendrier du site
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Button>
        }
      >
        <p>
          Les bénévoles s'inscrivent depuis le calendrier du site, sur chaque match à domicile à
          venir. Leur inscription arrive ici, où vous pouvez la retirer en cas d'erreur ou de
          désistement.
        </p>
      </EmptyState>
    )
  }

  return (
    <>
      <FilterBar
        label="Filtrer les inscriptions"
        onReset={hasActiveFilters ? clearFilters : undefined}
        count={{ shown, total, singular: 'inscription', plural: 'inscriptions' }}
      >
        <FilterGroup>
          <SimpleSelect
            value={filterEquipe}
            onValueChange={setFilterEquipe}
            options={equipeOptions}
            aria-label="Équipe"
            className="md:w-60"
          />
          <SimpleSelect
            value={filterRole}
            onValueChange={setFilterRole}
            options={ROLE_OPTIONS}
            aria-label="Poste"
            className="md:w-52"
          />
        </FilterGroup>
      </FilterBar>

      {groupesFiltres.length === 0 ? (
        <EmptyState
          title="Aucune inscription ne correspond"
          action={
            <Button type="button" variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          }
        >
          <p>
            Personne n'est inscrit à ce poste pour cette équipe. Retirez un filtre pour retrouver
            les autres bénévoles.
          </p>
        </EmptyState>
      ) : (
        groupesFiltres.map((groupe) => (
          <Section
            key={groupe.cle}
            title={groupe.titre}
            count={groupe.inscriptions.length}
            action={groupe.periode && <span className="adm-meta">{groupe.periode}</span>}
            className="mt-8 first-of-type:mt-2"
          >
            <DataList
              caption={`Bénévoles inscrits, ${groupe.titre.toLowerCase()}`}
              items={groupe.inscriptions}
              columns={columns}
              getKey={(inscription) => inscription.id}
              className="max-md:-mt-px"
              actions={(inscription) => (
                <RowActions
                  label={`Actions pour l'inscription de ${inscription.prenom} ${inscription.nom}`}
                  items={[
                    {
                      label: "Supprimer l'inscription",
                      icon: Trash2,
                      destructive: true,
                      onSelect: () => setDeleteId(inscription.id),
                    },
                  ]}
                />
              )}
            />
          </Section>
        ))
      )}

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Supprimer cette inscription ?"
        description="Cette action est irréversible. Le bénévole est retiré du match et du calendrier du site ; son poste redevient libre."
        confirmLabel="Supprimer l'inscription"
      />
    </>
  )
}
