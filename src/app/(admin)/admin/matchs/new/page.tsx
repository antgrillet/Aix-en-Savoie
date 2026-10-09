import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { createMatch, getEquipesForSelect } from '../actions'
import { MatchForm } from '../MatchForm'

export default async function NewMatchPage() {
  const equipes = await getEquipesForSelect()

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/matchs"
        backLabel="Matchs"
        title="Nouveau match"
        description="Ajoutez une rencontre au calendrier du club"
      />

      <MatchForm equipes={equipes} action={createMatch} />
    </div>
  )
}
