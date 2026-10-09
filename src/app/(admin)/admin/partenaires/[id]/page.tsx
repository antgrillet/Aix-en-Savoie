import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { PartenaireForm } from '../PartenaireForm'
import { getPartenaire, updatePartenaire } from '../actions'

export default async function EditPartenairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const partenaire = await getPartenaire(parseInt(id))

  if (!partenaire) {
    notFound()
  }

  const updateWithId = updatePartenaire.bind(null, partenaire.id)

  return (
    <div>
      <AdminPageHeader
        title={partenaire.nom}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Modifier la fiche partenaire
            <StatusBadge status={partenaire.published ? 'published' : 'draft'} />
            {partenaire.partenaire_majeur && <StatusBadge status="featured" />}
          </span>
        }
        backHref="/admin/partenaires"
        backLabel="Partenaires"
        actions={
          partenaire.published && partenaire.slug ? (
            <Button variant="outline" asChild>
              <a href={`/partenaires/${partenaire.slug}`} target="_blank" rel="noopener noreferrer">
                Voir la page
                <ArrowUpRight />
              </a>
            </Button>
          ) : undefined
        }
      />

      <PartenaireForm action={updateWithId} initialData={partenaire} />
    </div>
  )
}
