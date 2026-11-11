import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
import { getMatchs } from './actions'
import { MatchsList } from './MatchsList'

export default async function MatchsPage() {
  const matchs = await getMatchs()
  // L'heure de référence vient du serveur : la liste dit la même chose au
  // rendu et à l'hydratation (« à venir » ou « score en attente »).
  const maintenant = new Date()

  return (
    <div>
      <PageHeader
        title="Matchs"
        description="Le calendrier du club. Les matchs arrivent avec la synchronisation FFHANDBALL ou s'ajoutent à la main ; seuls les matchs publiés paraissent sur le site."
        actions={
          <Button asChild>
            <Link href="/admin/matchs/new">
              <Plus aria-hidden="true" />
              Nouveau match
            </Link>
          </Button>
        }
      />

      <MatchsList initialMatchs={matchs} maintenant={maintenant.getTime()} />
    </div>
  )
}
