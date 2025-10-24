import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-utils'
import { AdminNav } from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier l'authentification
  await requireAdmin()

  return (
    <div className="min-h-screen bg-neutral-100">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
