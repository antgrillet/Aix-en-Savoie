import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPartenaires } from './actions'
import { PartenairesList } from './PartenairesList'

export default async function PartenairesPage() {
  const partenaires = await getPartenaires()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partenaires</h1>
          <p className="text-muted-foreground">
            Gérez les partenaires du club
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/partenaires/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau partenaire
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des partenaires</CardTitle>
          <CardDescription>
            {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartenairesList initialPartenaires={partenaires} />
        </CardContent>
      </Card>
    </div>
  )
}
