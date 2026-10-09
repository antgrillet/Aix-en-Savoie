import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getPartenaires } from './actions'
import { PartenairesList } from './PartenairesList'

export default async function PartenairesPage() {
  const partenaires = await getPartenaires()
  const publies = partenaires.filter((p) => p.published).length

  return (
    <div>
      <AdminPageHeader
        title="Partenaires"
        description={`${partenaires.length} partenaire${partenaires.length > 1 ? 's' : ''} · ${publies} publié${publies > 1 ? 's' : ''} sur le site`}
        actions={
          <Button asChild>
            <Link href="/admin/partenaires/new">
              <Plus />
              Nouveau partenaire
            </Link>
          </Button>
        }
      />

      <PartenairesList initialPartenaires={partenaires} />
    </div>
  )
}
