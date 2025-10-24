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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matchs</h1>
          <p className="text-muted-foreground">
            Gérez les matchs du club
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/matchs/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau match
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des matchs</CardTitle>
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
