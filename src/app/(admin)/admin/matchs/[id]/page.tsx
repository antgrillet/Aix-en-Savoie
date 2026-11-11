import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/PageHeader'
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
      <PageHeader
        title="Modifier le match"
        description={`${match.equipe.nom} – ${match.adversaire}`}
        back={{ href: '/admin/matchs', label: 'Matchs' }}
      />
      <MatchForm match={match} equipes={equipes} action={updateMatchWithId} />
    </div>
  )
}
