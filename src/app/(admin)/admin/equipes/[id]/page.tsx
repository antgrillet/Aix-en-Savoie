import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    </div>
  )
}
