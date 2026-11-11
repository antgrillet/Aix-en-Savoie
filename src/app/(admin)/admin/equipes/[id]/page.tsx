import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/PageHeader'
import { SyncMatchesButton } from '@/components/admin/SyncMatchesButton'
import { EquipeForm } from '../EquipeForm'
import { getEquipe, updateEquipe } from '../actions'

export default async function EditEquipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const equipe = await getEquipe(parseInt(id))

  if (!equipe) {
    notFound()
  }

  const updateWithId = updateEquipe.bind(null, equipe.id)

  return (
    <div>
      <PageHeader
        title="Modifier l'équipe"
        description={equipe.nom}
        back={{ href: '/admin/equipes', label: 'Équipes' }}
        // La synchronisation lit le lien enregistré : sans lien, le champ
        // « Lien du calendrier des matchs » du formulaire dit comment l'activer
        actions={
          equipe.matches ? (
            <SyncMatchesButton
              equipeId={equipe.id}
              equipeNom={equipe.nom}
              hasMatchesUrl={!!equipe.matches}
            />
          ) : undefined
        }
      />
      <EquipeForm action={updateWithId} initialData={equipe} />
    </div>
  )
}
