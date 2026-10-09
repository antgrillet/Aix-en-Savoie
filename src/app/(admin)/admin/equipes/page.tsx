import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getEquipes } from './actions'
import { EquipesList } from './EquipesList'
import { SyncButton } from './SyncButton'

export default async function EquipesPage() {
  const equipes = await getEquipes()

  return (
    <div>
      <AdminPageHeader
        title="Équipes"
        description="Gérez les équipes du club et leur ordre d'affichage"
        actions={
          <>
            <SyncButton />
            <Button asChild>
              <Link href="/admin/equipes/new">
                <Plus />
                Nouvelle équipe
              </Link>
            </Button>
          </>
        }
      />

      <EquipesList initialEquipes={equipes} />
    </div>
  )
}
