import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEquipes } from './actions'
import { EquipesList } from './EquipesList'

export default async function EquipesPage() {
  const equipes = await getEquipes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Équipes</h1>
          <p className="text-muted-foreground">
            Gérez les équipes du club
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/equipes/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle équipe
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des équipes</CardTitle>
          <CardDescription>
            {equipes.length} équipe{equipes.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipesList initialEquipes={equipes} />
        </CardContent>
      </Card>
    </div>
  )
}
