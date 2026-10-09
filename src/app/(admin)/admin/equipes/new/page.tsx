import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { EquipeForm } from '../EquipeForm'
import { createEquipe } from '../actions'

export default function NewEquipePage() {
  return (
    <div>
      <AdminPageHeader
        backHref="/admin/equipes"
        backLabel="Équipes"
        title="Nouvelle équipe"
        description="Ajoutez une équipe du club et ses créneaux d'entraînement"
      />

      <EquipeForm action={createEquipe} />
    </div>
  )
}
