import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { PartenaireForm } from '../PartenaireForm'
import { createPartenaire } from '../actions'

export default function NewPartenairePage() {
  return (
    <div>
      <AdminPageHeader
        title="Nouveau partenaire"
        description="Créez la fiche d'un partenaire du club"
        backHref="/admin/partenaires"
        backLabel="Partenaires"
      />

      <PartenaireForm action={createPartenaire} />
    </div>
  )
}
