import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEquipes } from './actions'
import { EquipesList } from './EquipesList'
import { SyncButton } from './SyncButton'

export default async function EquipesPage() {
  const equipes = await getEquipes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Équipes
          </h1>
          <p className="text-muted-foreground">
            Gérez les équipes du club
          </p>
        </div>
        <div className="flex gap-3">
          <SyncButton />
          <Button asChild className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700">
            <Link href="/admin/equipes/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle équipe
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Liste des équipes
          </CardTitle>
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
