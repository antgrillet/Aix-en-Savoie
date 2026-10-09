import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getMatchs } from './actions'
import { MatchsList } from './MatchsList'

export default async function MatchsPage() {
  const matchs = await getMatchs()

  return (
    <div>
      <AdminPageHeader
        title="Matchs"
        description="Calendrier et résultats des équipes du club"
        actions={
          <Button asChild>
            <Link href="/admin/matchs/new">
              <Plus />
              Nouveau match
            </Link>
          </Button>
        }
      />

      <MatchsList initialMatchs={matchs} />
    </div>
  )
}
