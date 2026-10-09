import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatMatchTime, formatParis } from '@/lib/match-format'
import { getMatch, getEquipesForSelect, updateMatch } from '../actions'
import { MatchForm } from '../MatchForm'

interface EditMatchPageProps {
  params: Promise<{ id: string }>
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = await params
  const matchId = parseInt(id)

  const [match, equipes] = await Promise.all([
    getMatch(matchId),
    getEquipesForSelect(),
  ])

  if (!match) {
    notFound()
  }

  const updateMatchWithId = updateMatch.bind(null, matchId)

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/matchs"
        backLabel="Matchs"
        title={
          <>
            {match.equipe.nom} <span className="font-normal text-muted-foreground">vs</span> {match.adversaire}
          </>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={match.published ? 'published' : 'draft'} />
            <span>
              {formatParis(match.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à{' '}
              {formatMatchTime(match.date)}
            </span>
          </span>
        }
      />

      <MatchForm match={match} equipes={equipes} action={updateMatchWithId} />
    </div>
  )
}
