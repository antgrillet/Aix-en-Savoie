import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
import { getPartenaires } from './actions'
import { PartenairesList } from './PartenairesList'

export default async function PartenairesPage() {
  const partenaires = await getPartenaires()

  return (
    <div>
      <PageHeader
        title="Partenaires"
        description="Les entreprises et institutions qui soutiennent le club. Une fois publiés, ils apparaissent sur la page Partenaires dans l'ordre de cette liste, les partenaires majeurs en premier."
        actions={
          <Button asChild>
            <Link href="/admin/partenaires/new">
              <Plus aria-hidden="true" />
              Nouveau partenaire
            </Link>
          </Button>
        }
      />

      <PartenairesList initialPartenaires={partenaires} />
    </div>
  )
}
