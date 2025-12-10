import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getMatchs } from './actions'
import { MatchsList } from './MatchsList'

export default async function MatchsPage() {
  const matchs = await getMatchs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Matchs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les matchs du club
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 w-full sm:w-auto">
          <Link href="/admin/matchs/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau match
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Liste des matchs
          </CardTitle>
          <CardDescription>
            {matchs.length} match{matchs.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchsList initialMatchs={matchs} />
        </CardContent>
      </Card>
    </div>
  )
}
