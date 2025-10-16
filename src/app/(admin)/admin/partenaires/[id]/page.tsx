import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PartenaireForm } from '../PartenaireForm'
import { getPartenaire, updatePartenaire } from '../actions'

export default async function EditPartenairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const partenaire = await getPartenaire(parseInt(id))

  if (!partenaire) {
    notFound()
  }

  const updateWithId = updatePartenaire.bind(null, partenaire.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le partenaire</h1>
        <p className="text-muted-foreground">
          Modifiez les informations du partenaire
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du partenaire</CardTitle>
          <CardDescription>
            Modifiez les informations du partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartenaireForm action={updateWithId} initialData={partenaire} />
        </CardContent>
      </Card>
    </div>
  )
}
