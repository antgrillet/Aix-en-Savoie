import { PageHeader } from '@/components/admin/PageHeader'
import { PartenaireForm } from '../PartenaireForm'
import { createPartenaire } from '../actions'

export default function NewPartenairePage() {
  return (
    <div>
      <PageHeader
        title="Nouveau partenaire"
        description="Le nom, le logo et la description suffisent pour l'ajouter. Le reste enrichit sa page et peut attendre."
        back={{ href: '/admin/partenaires', label: 'Partenaires' }}
      />
      <PartenaireForm action={createPartenaire} />
    </div>
  )
}
