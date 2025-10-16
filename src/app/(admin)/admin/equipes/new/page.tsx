import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EquipeForm } from '../EquipeForm'
import { createEquipe } from '../actions'

export default function NewEquipePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle équipe</h1>
        <p className="text-muted-foreground">
          Ajoutez une nouvelle équipe du club
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'équipe</CardTitle>
          <CardDescription>
            Remplissez les informations de l'équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipeForm action={createEquipe} />
        </CardContent>
      </Card>
    </div>
  )
}
