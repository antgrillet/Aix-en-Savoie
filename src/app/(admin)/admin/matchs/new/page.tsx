import { PageHeader } from '@/components/admin/PageHeader'
import { createMatch, getEquipesForSelect } from '../actions'
import { MatchForm } from '../MatchForm'

export default async function NewMatchPage() {
  const equipes = await getEquipesForSelect()

  return (
    <div>
      <PageHeader
        title="Nouveau match"
        description="Pour un match que la synchronisation FFHANDBALL n'apporte pas : amical, tournoi, rencontre d'une équipe sans lien de championnat."
        back={{ href: '/admin/matchs', label: 'Matchs' }}
      />
      <MatchForm equipes={equipes} action={createMatch} />
    </div>
  )
}
