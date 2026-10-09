'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CalendarDays, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { deleteMatch } from './actions'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatMatchTime, formatParis, getMatchOutcome, OUTCOME_LABELS } from '@/lib/match-format'
import { cn } from '@/lib/utils'

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
}

const OUTCOME_CLASSES = {
  win: 'text-emerald-700',
  loss: 'text-red-700',
  draw: 'text-muted-foreground',
} as const

/** Pastille Domicile / Extérieur (même style que le tableau de bord) */
function VenuePill({ domicile }: { domicile: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        domicile ? 'bg-primary-50 text-primary-800' : 'bg-neutral-100 text-neutral-600'
      )}
    >
      {domicile ? 'Domicile' : 'Extérieur'}
    </span>
  )
}

/** Score final (avec issue du match) ou mention « À venir » */
function MatchScore({ match, compact }: { match: Match; compact?: boolean }) {
  if (!match.termine || match.scoreEquipe === null || match.scoreAdversaire === null) {
    return compact ? null : <span className="text-xs text-muted-foreground">À venir</span>
  }

  const outcome = getMatchOutcome(match.scoreEquipe, match.scoreAdversaire)

  return (
    <span className={cn('inline-flex items-baseline', compact ? 'gap-1.5' : 'flex-col gap-0.5')}>
      <span className="whitespace-nowrap font-display font-bold tabular-nums text-foreground">
        {match.scoreEquipe} – {match.scoreAdversaire}
      </span>
      {outcome && (
        <span className={cn('text-xs font-medium', OUTCOME_CLASSES[outcome])}>{OUTCOME_LABELS[outcome]}</span>
      )}
    </span>
  )
}

function MatchActions({ match, onDelete }: { match: Match; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
          <MoreHorizontal />
          <span className="sr-only">
            Actions pour {match.equipe.nom} contre {match.adversaire}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/admin/matchs/${match.id}`}>
            <Edit />
            Modifier
          </Link>
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
  )
}

export function MatchsList({ initialMatchs }: MatchsListProps) {
  const [matchs, setMatchs] = useState(initialMatchs)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedEquipeId, setSelectedEquipeId] = useState<string>('all')

  // Extraire les équipes uniques depuis les matchs
  const equipes = useMemo(() => {
    const uniqueEquipes = new Map<number, { id: number; nom: string; categorie: string }>()
    initialMatchs.forEach((match) => {
      if (!uniqueEquipes.has(match.equipe.id)) {
        uniqueEquipes.set(match.equipe.id, match.equipe)
      }
    })
    return Array.from(uniqueEquipes.values()).sort((a, b) => a.nom.localeCompare(b.nom))
  }, [initialMatchs])

  // Filtrer les matchs par équipe
  const filteredMatchs = useMemo(() => {
    if (selectedEquipeId === 'all') return matchs
    return matchs.filter((match) => match.equipe.id === parseInt(selectedEquipeId))
  }, [matchs, selectedEquipeId])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMatch(deleteId)
      setMatchs(matchs.filter((m) => m.id !== deleteId))
      toast.success('Match supprimé')
      setDeleteId(null)
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* Filtre par équipe */}
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:gap-3">
          <label htmlFor="filtre-equipe" className="text-sm font-medium text-muted-foreground">
            Équipe
          </label>
          <Select value={selectedEquipeId} onValueChange={setSelectedEquipeId}>
            <SelectTrigger id="filtre-equipe" className="h-10 w-full sm:h-9 sm:w-72">
              <SelectValue placeholder="Toutes les équipes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les équipes</SelectItem>
              {equipes.map((equipe) => (
                <SelectItem key={equipe.id} value={equipe.id.toString()}>
                  {equipe.nom} ({equipe.categorie})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredMatchs.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <CalendarDays className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {selectedEquipeId === 'all' ? 'Aucun match' : 'Aucun match pour cette équipe'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Les matchs ajoutés ou synchronisés depuis FFHANDBALL apparaîtront ici.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 font-medium">Rencontre</th>
                <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Lieu</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Score</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Statut</th>
                <th scope="col" className="w-14 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMatchs.map((match) => (
                <tr key={match.id} className="transition-colors hover:bg-muted/40">
                  <td className="w-24 py-3 pl-4 pr-2 align-top md:w-auto md:px-4 md:align-middle">
                    <p className="whitespace-nowrap font-medium">
                      {formatParis(match.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                      <span className="hidden lg:inline"> {formatParis(match.date, { year: 'numeric' })}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatMatchTime(match.date)}</p>
                  </td>
                  <td className="px-2 py-3 md:px-4">
                    <Link
                      href={`/admin/matchs/${match.id}`}
                      className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {match.equipe.nom} <span className="font-normal text-muted-foreground">vs</span> {match.adversaire}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {match.equipe.categorie}
                      {match.competition && ` · ${match.competition}`}
                    </p>
                    {/* Mobile : lieu, score et statut sous la rencontre */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 md:hidden">
                      <VenuePill domicile={match.domicile} />
                      <StatusBadge status={match.published ? 'published' : 'draft'} />
                      <MatchScore match={match} compact />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground xl:hidden">
                      <span className="hidden md:inline">{match.domicile ? 'Domicile' : 'Extérieur'} · </span>
                      {match.lieu}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <VenuePill domicile={match.domicile} />
                    <p className="mt-1 max-w-[200px] truncate text-xs text-muted-foreground" title={match.lieu}>
                      {match.lieu}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <MatchScore match={match} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <StatusBadge status={match.published ? 'published' : 'draft'} />
                  </td>
                  <td className="px-2 py-3 text-right align-top sm:px-4 md:align-middle">
                    <MatchActions match={match} onDelete={() => setDeleteId(match.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          {selectedEquipeId === 'all'
            ? `${matchs.length} match${matchs.length > 1 ? 's' : ''}`
            : `${filteredMatchs.length} sur ${matchs.length} match${matchs.length > 1 ? 's' : ''}`}
        </div>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce match ?"
        description="Cette action est irréversible. Le match sera définitivement supprimé."
      />
    </>
  )
}
