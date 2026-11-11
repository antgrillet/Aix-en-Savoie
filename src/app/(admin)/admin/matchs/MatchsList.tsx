'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/Button'
import { DataList, type DataColumn } from '@/components/admin/DataList'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { EmptyState } from '@/components/admin/EmptyState'
import { FilterBar } from '@/components/admin/FilterBar'
import { RowActions } from '@/components/admin/RowActions'
import { SimpleSelect } from '@/components/admin/Select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'
import { deleteMatch } from './actions'

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  published: boolean
  equipe: {
    id: number
    nom: string
    categorie: string
  }
}

interface MatchsListProps {
  initialMatchs: Match[]
  /** Heure du rendu serveur (ms) : sépare les matchs à venir des scores en attente */
  maintenant: number
}

const FUSEAU_CLUB = 'Europe/Paris'

const formatJour = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  hour: '2-digit',
  minute: '2-digit',
})

const formatJourLong = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function nomRencontre(match: Match) {
  return `${match.equipe.nom} – ${match.adversaire}`
}

/** Score du match, ou la raison pour laquelle il n'y en a pas encore */
function Score({ match, maintenant }: { match: Match; maintenant: number }) {
  if (match.termine && match.scoreEquipe !== null && match.scoreAdversaire !== null) {
    return (
      <span className="adm-num-sm whitespace-nowrap">
        {match.scoreEquipe} – {match.scoreAdversaire}
      </span>
    )
  }

  if (match.termine) {
    return <StatusMark tone="dashed">Joué, sans score</StatusMark>
  }

  if (new Date(match.date).getTime() > maintenant) {
    return <span className="whitespace-nowrap text-muted-foreground">À venir</span>
  }

  return <StatusMark tone="action">Score en attente</StatusMark>
}

export function MatchsList({ initialMatchs, maintenant }: MatchsListProps) {
  const [matchs, setMatchs] = useState(initialMatchs)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedEquipeId, setSelectedEquipeId] = useState<string>('all')

  // Extraire les équipes uniques depuis les matchs
  const equipeOptions = useMemo(() => {
    const uniqueEquipes = new Map<number, { id: number; nom: string; categorie: string }>()
    initialMatchs.forEach((match) => {
      if (!uniqueEquipes.has(match.equipe.id)) {
        uniqueEquipes.set(match.equipe.id, match.equipe)
      }
    })
    return [
      { value: 'all', label: 'Toutes les équipes' },
      ...Array.from(uniqueEquipes.values())
        .sort((a, b) => a.nom.localeCompare(b.nom))
        .map((equipe) => ({
          value: equipe.id.toString(),
          label: `${equipe.nom} (${equipe.categorie.trim()})`,
        })),
    ]
  }, [initialMatchs])

  // Filtrer les matchs par équipe
  const filteredMatchs = useMemo(() => {
    if (selectedEquipeId === 'all') return matchs
    return matchs.filter((match) => match.equipe.id === parseInt(selectedEquipeId))
  }, [matchs, selectedEquipeId])

  const hasActiveFilters = selectedEquipeId !== 'all'
  const clearFilters = () => setSelectedEquipeId('all')

  const matchASupprimer = matchs.find((match) => match.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMatch(deleteId)
      setMatchs(matchs.filter((m) => m.id !== deleteId))
      toast.success('Match supprimé')
      setDeleteId(null)
    } catch {
      toast.error("Le match n'a pas pu être supprimé. Réessayez dans un instant.")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: DataColumn<Match>[] = [
    {
      id: 'date',
      header: 'Date',
      className: 'w-32 whitespace-nowrap',
      cell: (match) => (
        <>
          <span className="md:block md:text-[0.8125rem] md:font-semibold md:leading-tight">
            {formatJour.format(new Date(match.date))}
          </span>
          <span aria-hidden="true" className="md:hidden">
            {' · '}
          </span>
          <span className="md:block md:text-[0.8125rem] md:text-muted-foreground">
            {formatHeure.format(new Date(match.date))}
          </span>
        </>
      ),
    },
    {
      id: 'rencontre',
      header: 'Rencontre',
      phone: 'title',
      cell: (match) => (
        <>
          <Link
            href={`/admin/matchs/${match.id}`}
            className="adm-row-link line-clamp-2 font-semibold decoration-1 underline-offset-4 hover:underline"
          >
            {nomRencontre(match)}
          </Link>
          <span className="adm-meta line-clamp-1 font-normal">
            {match.equipe.categorie.trim()}
            {match.competition && ` · ${match.competition}`}
          </span>
        </>
      ),
    },
    {
      id: 'score',
      header: 'Score',
      className: 'w-36',
      cell: (match) => <Score match={match} maintenant={maintenant} />,
    },
    {
      id: 'lieu',
      header: 'Lieu',
      phone: 'marks',
      className: 'w-24',
      cell: (match) => (
        <StatusMark tone={match.domicile ? 'fill' : 'solid'}>
          {match.domicile ? 'Domicile' : 'Extérieur'}
        </StatusMark>
      ),
    },
    {
      id: 'salle',
      header: 'Salle',
      className: 'hidden w-56 xl:table-cell',
      cell: (match) => <span className="md:line-clamp-2 md:text-[0.8125rem]">{match.lieu}</span>,
    },
    {
      id: 'statut',
      header: 'Statut',
      phone: 'marks',
      className: 'w-24',
      cell: (match) => <StatusBadge status={match.published ? 'published' : 'draft'} />,
    },
  ]

  return (
    <>
      <FilterBar
        label="Filtrer les matchs"
        onReset={hasActiveFilters ? clearFilters : undefined}
        count={{
          shown: filteredMatchs.length,
          total: matchs.length,
          singular: 'match',
          plural: 'matchs',
        }}
      >
        <SimpleSelect
          value={selectedEquipeId}
          onValueChange={setSelectedEquipeId}
          options={equipeOptions}
          aria-label="Équipe"
          className="md:w-80"
        />
      </FilterBar>

      <DataList
        caption="Matchs"
        items={filteredMatchs}
        columns={columns}
        getKey={(match) => match.id}
        actions={(match) => (
          <RowActions
            label={`Actions pour « ${nomRencontre(match)} »`}
            items={[
              { label: 'Modifier', icon: Pencil, href: `/admin/matchs/${match.id}` },
              'separator',
              {
                label: 'Supprimer',
                icon: Trash2,
                destructive: true,
                onSelect: () => setDeleteId(match.id),
              },
            ]}
          />
        )}
        empty={
          hasActiveFilters ? (
            <EmptyState
              title="Aucun match pour cette équipe"
              action={
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              }
            >
              <p>Retirez le filtre pour retrouver les matchs des autres équipes.</p>
            </EmptyState>
          ) : (
            <EmptyState
              title="Aucun match pour l'instant"
              action={
                <Button asChild>
                  <Link href="/admin/matchs/new">
                    <Plus aria-hidden="true" />
                    Ajouter le premier match
                  </Link>
                </Button>
              }
            >
              <p>
                Les matchs de championnat arrivent avec la synchronisation FFHANDBALL, pour chaque
                équipe dont le lien de championnat est renseigné. Un match amical ou un tournoi
                s'ajoute à la main.
              </p>
            </EmptyState>
          )
        }
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce match ?"
        description={
          matchASupprimer
            ? `${nomRencontre(matchASupprimer)}, ${formatJourLong.format(new Date(matchASupprimer.date))}. Cette action est irréversible : le match et les inscriptions de bénévoles qui y sont rattachées seront définitivement supprimés.`
            : 'Cette action est irréversible. Le match sera définitivement supprimé.'
        }
        confirmLabel="Supprimer le match"
      />
    </>
  )
}
