import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
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

  // La page publique n'existe que pour un partenaire publié
  const pagePublique = partenaire.published && partenaire.slug ? `/partenaires/${partenaire.slug}` : null

  return (
    <div>
      <PageHeader
        title="Modifier le partenaire"
        description={partenaire.nom}
        back={{ href: '/admin/partenaires', label: 'Partenaires' }}
        actions={
          pagePublique && (
            <Button asChild variant="outline">
              <Link href={pagePublique} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                Voir sa page
                <span className="sr-only"> (nouvel onglet)</span>
              </Link>
            </Button>
          )
        }
      />
      <PartenaireForm action={updateWithId} initialData={partenaire} />
    </div>
  )
}
