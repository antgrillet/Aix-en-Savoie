import { PageHeader } from '@/components/admin/PageHeader'
import { EquipeForm } from '../EquipeForm'
import { createEquipe } from '../actions'

export default function NewEquipePage() {
  return (
    <div>
      <PageHeader
        title="Nouvelle équipe"
        description="Présentez l'équipe, ajoutez sa photo et ses créneaux d'entraînement, puis publiez-la ou gardez-la en brouillon."
        back={{ href: '/admin/equipes', label: 'Équipes' }}
      />
      <EquipeForm action={createEquipe} />
    </div>
  )
}
