import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PartenaireForm } from '../PartenaireForm'
import { createPartenaire } from '../actions'

export default function NewPartenairePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau partenaire</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouveau partenaire du club
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du partenaire</CardTitle>
          <CardDescription>
            Remplissez les informations du partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartenaireForm action={createPartenaire} />
        </CardContent>
      </Card>
    </div>
  )
}
