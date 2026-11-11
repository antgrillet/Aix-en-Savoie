import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
import { getEquipes } from './actions'
import { EquipesList } from './EquipesList'
import { SyncButton, SyncProvider, SyncStatus } from './SyncButton'

export default async function EquipesPage() {
  const equipes = await getEquipes()

  return (
    <SyncProvider>
      <PageHeader
        title="Équipes"
        description={
          <>
            Les équipes du club, dans l'ordre où le site les affiche.
            <SyncStatus />
          </>
        }
        actions={
          <>
            <SyncButton />
            <Button asChild>
              <Link href="/admin/equipes/new">
                <Plus aria-hidden="true" />
                Nouvelle équipe
              </Link>
            </Button>
          </>
        }
      />

      <EquipesList initialEquipes={equipes} />
    </SyncProvider>
  )
}
