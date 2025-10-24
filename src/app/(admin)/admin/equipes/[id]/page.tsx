import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EquipeForm } from '../EquipeForm'
import { getEquipe, updateEquipe } from '../actions'
import { SyncMatchesButton } from '@/components/admin/SyncMatchesButton'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier l'équipe</h1>
        <p className="text-muted-foreground">
          Modifiez les informations de l'équipe
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'équipe</CardTitle>
          <CardDescription>
            Modifiez les informations de l'équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipeForm action={updateWithId} initialData={equipe} />
        </CardContent>
      </Card>

      {/* Section de synchronisation des matchs */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronisation des matchs</CardTitle>
          <CardDescription>
            Importez automatiquement les matchs depuis le championnat FFHANDBALL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {equipe.matches ? (
            <>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Lien du championnat :</span>{' '}
                <a
                  href={equipe.matches}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {equipe.matches}
                </a>
              </div>
              <SyncMatchesButton
                equipeId={equipe.id}
                equipeNom={equipe.nom}
                hasMatchesUrl={!!equipe.matches}
              />
              <p className="text-xs text-muted-foreground">
                💡 La synchronisation récupère automatiquement les matchs, dates, heures et scores depuis FFHANDBALL
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ajoutez un lien vers le championnat FFHANDBALL dans le champ "Lien calendrier matches" ci-dessus pour activer la synchronisation automatique.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
