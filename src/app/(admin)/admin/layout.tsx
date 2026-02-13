import { requireAdmin } from '@/lib/auth-utils'
import { AdminNav } from '@/components/admin/AdminNav'
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
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
