import { notFound } from 'next/navigation'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le match</h1>
        <p className="text-muted-foreground">
          {match.equipe.nom} vs {match.adversaire}
        </p>
      </div>

      <MatchForm match={match} equipes={equipes} action={updateMatchWithId} />
    </div>
  )
}
