import { requireAdmin } from '@/lib/auth-utils'
import { AdminShell } from '@/components/admin/AdminShell'
import { compteursParSection, getATraiter } from '@/components/admin/a-traiter'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'Administration',
  description: "Espace d'administration du HBC Aix-en-Savoie.",
  path: '/admin',
  noindex: true,
  nofollow: true,
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier l'authentification
  const session = await requireAdmin()

  // Les compteurs sont un confort : s'ils échouent, le rail s'affiche sans eux
  // et la page garde la main sur ses propres erreurs.
  const counts = await getATraiter()
    .then(compteursParSection)
    .catch(() => ({}))

  return (
    <AdminShell counts={counts} user={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AdminShell>
  )
}
