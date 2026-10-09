import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
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
  const session = await requireAdmin()

  const unreadMessages = await prisma.contactMessage.count({
    where: { read: false, archived: false },
  })

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <AdminNav
        user={{ name: session.user.name, email: session.user.email }}
        unreadMessages={unreadMessages}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  )
}
